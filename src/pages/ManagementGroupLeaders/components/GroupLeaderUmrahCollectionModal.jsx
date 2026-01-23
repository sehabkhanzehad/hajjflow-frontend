import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useI18n } from '@/contexts/I18nContext'
import { toast } from "sonner"
import api from '@/lib/api'
import { ChevronsUpDown, Package } from 'lucide-react'

const umrahCollectionSchema = z.object({
    section_id: z.string().min(1, 'Section is required'),
    type: z.enum(['income', 'expense']),
    voucher_no: z.string().min(1, 'Voucher number is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    amount: z.union([z.string(), z.number()]).refine((val) => {
        const num = typeof val === 'string' ? parseFloat(val) : val
        return !isNaN(num) && num > 0
    }, 'Amount must be a valid positive number'),
    date: z.string().min(1, 'Date is required'),
    package_id: z.string().min(1, 'Package is required'),
    umrah_id: z.string().optional(),
})

export default function GroupLeaderUmrahCollectionModal({ open, onOpenChange }) {
    const { t, language } = useI18n()
    const queryClient = useQueryClient()
    const [selectedSectionId, setSelectedSectionId] = useState('')
    const [selectedSection, setSelectedSection] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const [selectedPackage, setSelectedPackage] = useState(null)
    const [packageSearchTerm, setPackageSearchTerm] = useState('')
    const [isPackageSelectOpen, setIsPackageSelectOpen] = useState(false)
    const [selectedUmrah, setSelectedUmrah] = useState(null)
    const [umrahSearchTerm, setUmrahSearchTerm] = useState('')
    const [isUmrahSelectOpen, setIsUmrahSelectOpen] = useState(false)
    const dropdownRef = useRef(null)
    const packageDropdownRef = useRef(null)
    const umrahDropdownRef = useRef(null)

    const form = useForm({
        resolver: zodResolver(umrahCollectionSchema),
        defaultValues: {
            section_id: '',
            type: 'income',
            voucher_no: '',
            title: '',
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            package_id: '',
            umrah_id: '',
        }
    })

    const { data: sections = [] } = useQuery({
        queryKey: ['group-leader-sections'],
        queryFn: async () => {
            const response = await api.get('/group-leaders/sections')
            return response.data.data
        },
        enabled: open
    })

    const { data: packages = [] } = useQuery({
        queryKey: ['group-leader-umrah-packages'],
        queryFn: async () => {
            const response = await api.get('/group-leaders/umrah-packages')
            return response.data.data
        },
        enabled: open
    })

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSelectOpen(false)
            }
            if (packageDropdownRef.current && !packageDropdownRef.current.contains(event.target)) {
                setIsPackageSelectOpen(false)
            }
            if (umrahDropdownRef.current && !umrahDropdownRef.current.contains(event.target)) {
                setIsUmrahSelectOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const filteredSections = useMemo(() => {
        if (!searchTerm) return sections
        return sections.filter(section =>
            section.attributes?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.relationships?.groupLeader?.attributes?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [sections, searchTerm])

    const filteredPackages = useMemo(() => {
        if (!packageSearchTerm) return packages
        return packages.filter(pkg =>
            pkg.attributes?.name?.toLowerCase().includes(packageSearchTerm.toLowerCase())
        )
    }, [packages, packageSearchTerm])

    const availableUmrahs = useMemo(() => {
        if (!selectedPackage || !selectedSection) return []
        return (selectedPackage.relationships?.umrahs || []).filter(umrah =>
            umrah.relationships?.groupLeader?.id === selectedSection.relationships?.groupLeader?.id
        )
    }, [selectedPackage, selectedSection])

    const filteredUmrahs = useMemo(() => {
        if (!umrahSearchTerm) return availableUmrahs
        return availableUmrahs.filter(umrah =>
            umrah.relationships?.pilgrim?.relationships?.user?.attributes?.name?.toLowerCase().includes(umrahSearchTerm.toLowerCase()) ||
            umrah.relationships?.pilgrim?.relationships?.user?.attributes?.phone?.toLowerCase().includes(umrahSearchTerm.toLowerCase())
        )
    }, [availableUmrahs, umrahSearchTerm])

    // Get display info for selected section
    const getSectionDisplay = (section) => {
        if (!section) return null
        return {
            name: section.attributes?.name || 'Unnamed',
            avatar: section.relationships?.groupLeader?.relationships?.user?.attributes?.avatar,
            fallback: section.relationships?.groupLeader?.attributes?.name?.charAt(0) || section.attributes?.name?.charAt(0) || 'U'
        }
    }

    // Get display info for selected package
    const getPackageDisplay = (pkg) => {
        if (!pkg) return null
        return {
            name: pkg.attributes?.name || 'Unnamed Package',
            price: pkg.attributes?.price || 'N/A'
        }
    }

    // Get display info for selected umrah
    const getUmrahDisplay = (umrah) => {
        if (!umrah || !umrah.relationships?.pilgrim?.relationships?.user?.attributes) return null
        return {
            name: umrah.relationships.pilgrim.relationships.user.attributes.name || 'Unknown',
            phone: umrah.relationships.pilgrim.relationships.user.attributes.phone || 'N/A',
            avatar: umrah.relationships?.pilgrim?.relationships?.user?.attributes?.avatar
        }
    }

    const collectionMutation = useMutation({
        mutationFn: (data) => api.post('/group-leaders/umrah-collection', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['management-group-leaders'] })
            toast.success(t({ en: 'Collection recorded successfully', bn: 'কালেকশন সফলভাবে রেকর্ড হয়েছে' }))
            handleClose()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || t({ en: 'Failed to record collection', bn: 'কালেকশন রেকর্ড করতে ব্যর্থ হয়েছে' }))
        }
    })

    useEffect(() => {
        if (selectedSection) {
            form.setValue('section_id', selectedSection.id.toString())
            form.clearErrors('section_id')
            setSelectedPackage(null)
            form.setValue('package_id', '')
            setSelectedUmrah(null)
            form.setValue('umrah_id', '')
        } else {
            form.setValue('section_id', '')
        }
    }, [selectedSection, form])

    useEffect(() => {
        if (selectedPackage) {
            form.setValue('package_id', selectedPackage.id.toString())
            form.clearErrors('package_id')
            setSelectedUmrah(null)
            form.setValue('umrah_id', '')
        } else {
            form.setValue('package_id', '')
            setSelectedUmrah(null)
            form.setValue('umrah_id', '')
        }
    }, [selectedPackage, form])

    useEffect(() => {
        if (selectedUmrah) {
            form.setValue('umrah_id', selectedUmrah.id.toString())
            form.clearErrors('umrah_id')
        } else {
            form.setValue('umrah_id', '')
        }
    }, [selectedUmrah, form])


    const onSubmit = (data) => {
        if (selectedSection?.relationships?.groupLeader?.attributes?.pilgrimRequired && !data.umrah_id) {
            form.setError('umrah_id', {
                type: 'manual',
                message: t({ en: 'Pilgrim is required for this group leader', bn: 'এই গ্রুপ লিডারের জন্য পিলগ্রিম প্রয়োজন' })
            })
            return
        }

        // Add prefix to voucher number before sending to backend
        const prefix = data.type === 'income' ? 'H' : 'E'
        const processedData = {
            ...data,
            voucher_no: `${prefix}${data.voucher_no}`
        }

        collectionMutation.mutate(processedData)
    }

    const handleClose = () => {
        form.reset()
        setSelectedSection(null)
        setSelectedSectionId('')
        setSearchTerm('')
        setSelectedPackage(null)
        setPackageSearchTerm('')
        setSelectedUmrah(null)
        setUmrahSearchTerm('')
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${language === 'bn' ? 'font-bengali' : ''}`}>
                <DialogHeader>
                    <DialogTitle>
                        {t({ en: "Umrah Collection", bn: "উমরাহ কালেকশন" })}
                    </DialogTitle>
                    <DialogDescription>
                        {t({ en: "Record a new umrah collection transaction", bn: "নতুন উমরাহ কালেকশন ট্রানজেকশন রেকর্ড করুন" })}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Section Selection */}
                            <FormField
                                control={form.control}
                                name="section_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Group Leader", bn: "গ্রুপ লিডার" })} *</FormLabel>
                                        <FormControl>
                                            <div className="relative" ref={dropdownRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {selectedSection ? (
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarImage src={getSectionDisplay(selectedSection)?.avatar} />
                                                                <AvatarFallback className="text-xs flex items-center justify-center">
                                                                    {getSectionDisplay(selectedSection)?.fallback}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-sm flex items-center gap-2">
                                                                    {selectedSection.relationships?.groupLeader?.relationships?.user?.attributes?.name || 'Unknown'}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {selectedSection.relationships?.groupLeader?.relationships?.user?.attributes?.phone || 'No Phone'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            {t({ en: "Select group leader", bn: "গ্রুপ লিডার নির্বাচন করুন" })}
                                                        </span>
                                                    )}
                                                    <ChevronsUpDown className={`h-5 w-5 transition-transform ${isSelectOpen ? 'rotate-180 text-primary opacity-100' : 'text-muted-foreground opacity-60'}`} strokeWidth={2.5} />
                                                </button>
                                                {isSelectOpen && (
                                                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg">
                                                        <div className="p-2">
                                                            <Input
                                                                placeholder={t({ en: "Search sections...", bn: "সেকশন খুঁজুন..." })}
                                                                value={searchTerm}
                                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                                className="mb-2"
                                                            />
                                                        </div>
                                                        <div className="max-h-60 overflow-y-auto">
                                                            {filteredSections.map((section) => (
                                                                <div
                                                                    key={section.id}
                                                                    onClick={() => {
                                                                        setSelectedSection(section)
                                                                        setIsSelectOpen(false)
                                                                        setSearchTerm('')
                                                                    }}
                                                                    className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer"
                                                                >
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarImage src={getSectionDisplay(section)?.avatar} />
                                                                        <AvatarFallback className="text-xs">
                                                                            {getSectionDisplay(section)?.fallback}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <div className="font-medium">{section.relationships?.groupLeader?.relationships?.user?.attributes?.name || 'Unknown'}</div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {section.relationships?.groupLeader?.relationships?.user?.attributes?.phone || 'No Phone'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}                                                    </div>                                                </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Package Selection */}
                            <FormField
                                control={form.control}
                                name="package_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Umrah Package", bn: "উমরাহ প্যাকেজ" })} *</FormLabel>
                                        <FormControl>
                                            <div className="relative" ref={packageDropdownRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsPackageSelectOpen(!isPackageSelectOpen)}
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {selectedPackage ? (
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <Package className="h-6 w-6" />
                                                            <div className="flex flex-col text-left">
                                                                <span className="font-medium text-sm">{selectedPackage.attributes?.name || 'Unnamed Package'}</span>
                                                                <span className="text-xs text-muted-foreground text-left">{selectedPackage.relationships?.umrahs?.length || 0} Umrahs</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">{t({ en: "Select umrah package", bn: "উমরাহ প্যাকেজ নির্বাচন করুন" })}</span>
                                                    )}
                                                    <ChevronsUpDown className={`h-5 w-5 transition-transform ${isPackageSelectOpen ? 'rotate-180 text-primary opacity-100' : 'text-muted-foreground opacity-60'}`} strokeWidth={2.5} />
                                                </button>
                                                {isPackageSelectOpen && (
                                                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg">
                                                        <div className="p-2">
                                                            <Input
                                                                placeholder={t({ en: "Search packages...", bn: "প্যাকেজ খুঁজুন..." })}
                                                                value={packageSearchTerm}
                                                                onChange={(e) => setPackageSearchTerm(e.target.value)}
                                                                className="mb-2"
                                                            />
                                                        </div>
                                                        <div className="max-h-60 overflow-y-auto">
                                                            {filteredPackages.map((pkg) => (
                                                                <div
                                                                    key={pkg.id}
                                                                    onClick={() => {
                                                                        setSelectedPackage(pkg)
                                                                        setIsPackageSelectOpen(false)
                                                                        setPackageSearchTerm('')
                                                                    }}
                                                                    className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer"
                                                                >
                                                                    <Package className="h-4 w-4" />
                                                                    <div>
                                                                        <div className="font-medium">{pkg.attributes?.name || 'Unnamed Package'}</div>
                                                                        <div className="text-sm text-muted-foreground">{pkg.relationships?.umrahs?.length || 0} Umrahs</div>
                                                                    </div>
                                                                </div>
                                                            ))}                                                </div>                                                </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        {/* Umrah Selection */}
                        <FormField
                            control={form.control}
                            name="umrah_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t({ en: "Pilgrim", bn: "পিলগ্রিম" })}{selectedSection?.relationships?.groupLeader?.attributes?.pilgrimRequired ? ' *' : ''}
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative" ref={umrahDropdownRef}>
                                            <button
                                                type="button"
                                                onClick={() => selectedPackage && setIsUmrahSelectOpen(!isUmrahSelectOpen)}
                                                disabled={!selectedPackage}
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {selectedUmrah ? (
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={getUmrahDisplay(selectedUmrah).avatar} />
                                                            <AvatarFallback className="text-xs flex items-center justify-center">
                                                                {getUmrahDisplay(selectedUmrah).name[0] || '?'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col text-left">
                                                            <span className="font-medium text-sm">
                                                                {getUmrahDisplay(selectedUmrah).name}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {getUmrahDisplay(selectedUmrah).phone}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        {selectedPackage ? (
                                                            availableUmrahs.length === 0 ? 
                                                                t({ en: "No pilgrims available", bn: "কোন পিলগ্রিম উপলব্ধ নেই" }) : 
                                                                t({ en: "Select pilgrim", bn: "পিলগ্রিম নির্বাচন করুন" })
                                                        ) : t({ en: "Select package first", bn: "প্রথমে প্যাকেজ নির্বাচন করুন" })}
                                                    </span>
                                                )}
                                                <ChevronsUpDown className={`h-5 w-5 transition-transform ${isUmrahSelectOpen ? 'rotate-180 text-primary opacity-100' : 'text-muted-foreground opacity-60'}`} strokeWidth={2.5} />
                                            </button>
                                            {isUmrahSelectOpen && selectedPackage && (
                                                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg">
                                                    <div className="p-2">
                                                        <Input
                                                            placeholder={t({ en: "Search pilgrims...", bn: "পিলগ্রিম খুঁজুন..." })}
                                                            value={umrahSearchTerm}
                                                            onChange={(e) => setUmrahSearchTerm(e.target.value)}
                                                            className="mb-2"
                                                        />
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {filteredUmrahs.length === 0 ? (
                                                            <div className="p-3 text-center text-muted-foreground">
                                                                {t({ en: "No pilgrims available for this group leader and package", bn: "এই গ্রুপ লিডার এবং প্যাকেজের জন্য কোন পিলগ্রিম উপলব্ধ নেই" })}
                                                            </div>
                                                        ) : (
                                                            filteredUmrahs.map((umrah) => (
                                                                <div
                                                                    key={umrah.id}
                                                                    onClick={() => {
                                                                        setSelectedUmrah(umrah)
                                                                        setIsUmrahSelectOpen(false)
                                                                        setUmrahSearchTerm('')
                                                                    }}
                                                                    className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                                                                >
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarImage src={getUmrahDisplay(umrah).avatar} />
                                                                        <AvatarFallback className="text-xs">
                                                                            {getUmrahDisplay(umrah).name[0] || '?'}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-medium text-sm truncate">
                                                                            {getUmrahDisplay(umrah).name}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground truncate">
                                                                            {getUmrahDisplay(umrah).phone}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Type */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t({ en: "Type", bn: "ধরন" })} *</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-6"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="income" id="income" />
                                                <label htmlFor="income" className="text-sm font-medium">{t({ en: "Income", bn: "আয়" })}</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="expense" id="expense" />
                                                <label htmlFor="expense" className="text-sm font-medium">{t({ en: "Expense", bn: "ব্যয়" })}</label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="voucher_no"
                                render={({ field }) => {
                                    const type = form.watch('type')
                                    const prefix = type === 'income' ? 'H' : 'E'

                                    return (
                                        <FormItem>
                                            <FormLabel>{t({ en: "Voucher No", bn: "ভাউচার নং" })} *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t({ en: "Enter voucher number", bn: "ভাউচার নম্বর লিখুন" })}
                                                    value={field.value ? `${prefix}${field.value}` : prefix}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value.startsWith(prefix)) {
                                                            field.onChange(value.slice(1));
                                                        } else {
                                                            // If user tries to remove prefix, keep it
                                                            field.onChange(field.value || '');
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Date", bn: "তারিখ" })} *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Title", bn: "শিরোনাম" })} *</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t({ en: "Enter collection title", bn: "কালেকশন শিরোনাম লিখুন" })} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Amount", bn: "পরিমাণ" })} *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder={t({ en: "Enter amount", bn: "পরিমাণ লিখুন" })}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t({ en: "Description", bn: "বিবরণ" })}</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} rows={3} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                {t({ en: "Cancel", bn: "বাতিল" })}
                            </Button>
                            <Button type="submit" disabled={collectionMutation.isPending}>
                                {collectionMutation.isPending ? t({ en: "Recording...", bn: "রেকর্ড হচ্ছে..." }) : t({ en: "Record Collection", bn: "কালেকশন রেকর্ড করুন" })}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}