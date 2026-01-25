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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useI18n } from '@/contexts/I18nContext'
import { toast } from "sonner"
import api from '@/lib/api'
import { ChevronsUpDown, Package, Users } from 'lucide-react'

const umrahExpenseSchema = z.object({
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
    group_leader_id: z.string().optional(),
})

export default function UmrahExpenseModal({ open, onOpenChange }) {
    const { t, language } = useI18n()
    const queryClient = useQueryClient()
    const [selectedPackage, setSelectedPackage] = useState(null)
    const [packageSearchTerm, setPackageSearchTerm] = useState('')
    const [isPackageSelectOpen, setIsPackageSelectOpen] = useState(false)
    const [selectedGroupLeader, setSelectedGroupLeader] = useState(null)
    const [groupLeaderSearchTerm, setGroupLeaderSearchTerm] = useState('')
    const [isGroupLeaderSelectOpen, setIsGroupLeaderSelectOpen] = useState(false)
    const packageDropdownRef = useRef(null)
    const groupLeaderDropdownRef = useRef(null)

    const form = useForm({
        resolver: zodResolver(umrahExpenseSchema),
        defaultValues: {
            type: 'expense',
            voucher_no: '',
            title: '',
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            package_id: '',
            group_leader_id: '',
        }
    })

    const { data: packages = [] } = useQuery({
        queryKey: ['umrah-packages'],
        queryFn: async () => {
            const response = await api.get('/sections/umrahs/expenses/packages')
            return response.data.data
        },
        enabled: open
    })

    const { data: groupLeaders = [] } = useQuery({
        queryKey: ['umrah-group-leaders'],
        queryFn: async () => {
            const response = await api.get('/sections/umrahs/expenses/group-leaders')
            return response.data.data
        },
        enabled: open
    })

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (packageDropdownRef.current && !packageDropdownRef.current.contains(event.target)) {
                setIsPackageSelectOpen(false)
            }
            if (groupLeaderDropdownRef.current && !groupLeaderDropdownRef.current.contains(event.target)) {
                setIsGroupLeaderSelectOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const filteredPackages = useMemo(() => {
        if (!packageSearchTerm) return packages
        return packages.filter(pkg =>
            pkg.attributes.name.toLowerCase().includes(packageSearchTerm.toLowerCase())
        )
    }, [packages, packageSearchTerm])

    const filteredGroupLeaders = useMemo(() => {
        if (!groupLeaderSearchTerm) return groupLeaders
        return groupLeaders.filter(gl =>
            gl.attributes.groupName.toLowerCase().includes(groupLeaderSearchTerm.toLowerCase()) ||
            gl.relationships.user.attributes.name.toLowerCase().includes(groupLeaderSearchTerm.toLowerCase())
        )
    }, [groupLeaders, groupLeaderSearchTerm])

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/sections/umrahs/expenses', data)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['umrah-expenses'])
            handleClose()
            toast.success('Umrah expense transaction recorded successfully.')
        },
        onError: (error) => {
            toast.error('Failed to record transaction.')
        }
    })

    useEffect(() => {
        if (selectedPackage) {
            form.setValue('package_id', selectedPackage.id.toString())
        }
    }, [selectedPackage, form])

    useEffect(() => {
        if (selectedGroupLeader) {
            form.setValue('group_leader_id', selectedGroupLeader.id.toString())
        } else {
            form.setValue('group_leader_id', '')
        }
    }, [selectedGroupLeader, form])

    const onSubmit = (data) => {
        // Add prefix to voucher number before sending to backend
        const prefix = data.type === 'income' ? 'I' : 'E'
        const processedData = {
            ...data,
            voucher_no: `${prefix}${data.voucher_no}`
        }
        createMutation.mutate(processedData)
    }

    const handleClose = () => {
        form.reset()
        setSelectedPackage(null)
        setPackageSearchTerm('')
        setSelectedGroupLeader(null)
        setGroupLeaderSearchTerm('')
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${language === 'bn' ? 'font-bengali' : ''}`}>
                <DialogHeader>
                    <DialogTitle>
                        {t({ en: "Add Umrah Expense", bn: "উমরাহ ব্যয় যোগ করুন" })}
                    </DialogTitle>
                    <DialogDescription>
                        {t({ en: "Record a new umrah expense transaction", bn: "নতুন উমরাহ ব্যয় ট্রানজেকশন রেকর্ড করুন" })}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                                <span className="text-xs text-muted-foreground">${selectedPackage.attributes?.price || 0}</span>
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
                                                                        <div className="text-sm text-muted-foreground">${pkg.attributes?.price || 0}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Group Leader Selection */}
                            <FormField
                                control={form.control}
                                name="group_leader_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Group Leader", bn: "গ্রুপ লিডার" })}</FormLabel>
                                        <FormControl>
                                            <div className="relative" ref={groupLeaderDropdownRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsGroupLeaderSelectOpen(!isGroupLeaderSelectOpen)}
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {selectedGroupLeader ? (
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarImage src={selectedGroupLeader.relationships?.user?.attributes?.avatar} />
                                                                <AvatarFallback className="text-xs flex items-center justify-center">
                                                                    {selectedGroupLeader.relationships?.user?.attributes?.name?.[0] || '?'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col text-left">
                                                                <span className="font-medium text-sm">{selectedGroupLeader.attributes?.groupName || 'Unnamed Group'}</span>
                                                                <span className="text-xs text-muted-foreground">{selectedGroupLeader.relationships?.user?.attributes?.phone || 'Unknown User'}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">{t({ en: "Select group leader", bn: "গ্রুপ লিডার নির্বাচন করুন" })}</span>
                                                    )}
                                                    <ChevronsUpDown className={`h-5 w-5 transition-transform ${isGroupLeaderSelectOpen ? 'rotate-180 text-primary opacity-100' : 'text-muted-foreground opacity-60'}`} strokeWidth={2.5} />
                                                </button>
                                                {isGroupLeaderSelectOpen && (
                                                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg">
                                                        <div className="p-2">
                                                            <Input
                                                                placeholder={t({ en: "Search group leaders...", bn: "গ্রুপ লিডার খুঁজুন..." })}
                                                                value={groupLeaderSearchTerm}
                                                                onChange={(e) => setGroupLeaderSearchTerm(e.target.value)}
                                                                className="mb-2"
                                                            />
                                                        </div>
                                                        <div className="max-h-60 overflow-y-auto">
                                                            {filteredGroupLeaders.map((gl) => (
                                                                <div
                                                                    key={gl.id}
                                                                    onClick={() => {
                                                                        setSelectedGroupLeader(gl)
                                                                        setIsGroupLeaderSelectOpen(false)
                                                                        setGroupLeaderSearchTerm('')
                                                                    }}
                                                                    className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer"
                                                                >
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarImage src={gl.relationships?.user?.attributes?.avatar} />
                                                                        <AvatarFallback className="text-xs flex items-center justify-center">
                                                                            {gl.relationships?.user?.attributes?.name?.[0] || '?'}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <div className="font-medium">{gl.attributes?.groupName || 'Unnamed Group'}</div>
                                                                        <div className="text-sm text-muted-foreground">{gl.relationships?.user?.attributes?.phone || 'N/A'}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                    const prefix = type === 'income' ? 'I' : 'E'

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
                                            <Input placeholder={t({ en: "Enter expense title", bn: "ব্যয় শিরোনাম লিখুন" })} {...field} />
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

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t({ en: "Description", bn: "বিবরণ" })}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t({ en: "Enter description (optional)", bn: "বিবরণ লিখুন (ঐচ্ছিক)" })}
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                {t({ en: "Cancel", bn: "বাতিল" })}
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? t({ en: "Creating...", bn: "তৈরি হচ্ছে..." }) : t({ en: "Add", bn: "যোগ করুন" })}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}