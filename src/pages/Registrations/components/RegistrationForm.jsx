import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronsUpDown } from 'lucide-react'
import { ImageUpload } from "@/components/ui/image-upload"
import { Textarea } from "@/components/ui/textarea"

export function RegistrationForm({ open, onOpenChange, editingRegistration, onSubmit, isSubmitting, preRegistrations, packages, banks }) {
    const [selectedPreRegistration, setSelectedPreRegistration] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSelectOpen(false)
                setSearchQuery('')
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Create schema based on whether we're editing or creating
    const registrationSchema = z.object({
        pre_registration_id: z.string().min(1, "Pre-registration is required"),
        package_id: z.string().min(1, "Package is required"),
        bank_id: z.string().min(1, "Bank is required"),
        date: z.string().min(1, "Registration date is required"),
        ...(editingRegistration ? {
            // When editing, passport fields are optional
            passport_number: z.string().optional(),
            passport_type: z.enum(['ordinary', 'official', 'diplomatic']).optional(),
            issue_date: z.string().optional(),
            expiry_date: z.string().optional(),
        } : {
            // When creating, passport fields are required
            passport_number: z.string().min(1, "Passport number is required"),
            passport_type: z.enum(['ordinary', 'official', 'diplomatic'], {
                required_error: "Passport type is required",
            }),
            issue_date: z.string().min(1, "Issue date is required"),
            expiry_date: z.string().min(1, "Expiry date is required"),
        }),
        passport_file: z.any().optional(),
        passport_notes: z.string().optional(),
    })

    const form = useForm({
        resolver: zodResolver(registrationSchema),
        mode: 'onSubmit',
        defaultValues: {
            pre_registration_id: '',
            package_id: '',
            bank_id: '',
            date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
            passport_number: '',
            passport_type: 'ordinary',
            issue_date: '',
            expiry_date: '',
            passport_file: null,
            passport_notes: '',
        }
    })

    // Filter pre-registrations based on search query
    const filteredPreRegistrations = preRegistrations?.filter((preReg) => {
        if (!searchQuery) return true
        const user = preReg.relationships?.pilgrim?.relationships?.user?.attributes
        const groupLeader = preReg.relationships?.groupLeader?.attributes
        const searchLower = searchQuery.toLowerCase()

        return (
            user?.fullName?.toLowerCase().includes(searchLower) ||
            user?.phone?.toLowerCase().includes(searchLower) ||
            user?.firstName?.toLowerCase().includes(searchLower) ||
            user?.lastName?.toLowerCase().includes(searchLower) ||
            groupLeader?.groupName?.toLowerCase().includes(searchLower) ||
            preReg.attributes?.serialNo?.toLowerCase().includes(searchLower)
        )
    })

    useEffect(() => {
        if (editingRegistration && open) {
            const preReg = preRegistrations?.find(p => p.id.toString() === editingRegistration.relationships?.preRegistration?.id?.toString())
            setSelectedPreRegistration(preReg || null)
            form.reset({
                pre_registration_id: editingRegistration.relationships?.preRegistration?.id?.toString() || '',
                package_id: editingRegistration.relationships?.package?.id?.toString() || '',
                bank_id: editingRegistration.relationships?.bank?.id?.toString() || '',
                date: editingRegistration.attributes?.date ? editingRegistration.attributes.date.split('T')[0] : new Date().toISOString().split('T')[0],
            })
        } else if (!editingRegistration && open) {
            setSelectedPreRegistration(null)
            form.reset({
                pre_registration_id: '',
                package_id: '',
                bank_id: '',
                date: new Date().toISOString().split('T')[0],
                passport_number: '',
                passport_type: 'ordinary',
                issue_date: '',
                expiry_date: '',
                passport_file: null,
                passport_notes: '',
            })
        }
    }, [editingRegistration, form, preRegistrations, open])

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'N/A'
    }

    const handleClose = () => {
        onOpenChange(false)
        setSelectedPreRegistration(null)
        setSearchQuery('')
        setIsSelectOpen(false)
        // Reset form when modal is closed
        form.reset({
            pre_registration_id: '',
            package_id: '',
            bank_id: '',
            date: new Date().toISOString().split('T')[0],
            passport_number: '',
            passport_type: 'ordinary',
            issue_date: '',
            expiry_date: '',
            passport_file: null,
            passport_notes: '',
        })
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-xl max-h-screen">
                <DialogHeader>
                    <DialogTitle>
                        {editingRegistration ? 'Edit Registration' : 'Create Registration'}
                    </DialogTitle>
                    <DialogDescription>
                        {editingRegistration ? 'Update the registration information.' : 'Fill in the details to create a new registration.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => {
                        // Only send passport_file if it's a new File instance (not URL or null)
                        const submitData = { ...data }
                        if (!submitData.passport_file || !(submitData.passport_file instanceof File)) {
                            delete submitData.passport_file
                        }
                        // Ensure date is sent as date-only (YYYY-MM-DD)
                        if (submitData.date) {
                            submitData.date = submitData.date.split('T')[0]
                        }
                        onSubmit(submitData)
                    })} className="space-y-6">
                        {/* Pre-registration and Package in one row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="pre_registration_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pre-registration</FormLabel>
                                        <input type="hidden" {...field} />
                                        <div className="relative">
                                            <div
                                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                                onClick={() => setIsSelectOpen(!isSelectOpen)}
                                            >
                                                {selectedPreRegistration ? (
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={selectedPreRegistration.relationships?.pilgrim?.relationships?.user?.attributes?.avatar} />
                                                            <AvatarFallback className="text-xs">
                                                                {getInitials(
                                                                    selectedPreRegistration.relationships?.pilgrim?.relationships?.user?.attributes?.firstName,
                                                                    selectedPreRegistration.relationships?.pilgrim?.relationships?.user?.attributes?.lastName
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-sm">
                                                                {selectedPreRegistration.relationships?.pilgrim?.relationships?.user?.attributes?.firstName} {selectedPreRegistration.relationships?.pilgrim?.relationships?.user?.attributes?.lastName}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                NG-{selectedPreRegistration.attributes.serialNo}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        Select pre-registration
                                                    </span>
                                                )}
                                                <ChevronsUpDown className={`h-5 w-5 transition-transform ${isSelectOpen ? 'rotate-180 text-primary opacity-100' : 'text-muted-foreground opacity-60'}`} strokeWidth={2.5} />
                                            </div>

                                            {isSelectOpen && (
                                                <div ref={dropdownRef} className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md">
                                                    {/* Search Input */}
                                                    <div className="p-2 border-b">
                                                        <div className="relative">
                                                            <Input
                                                                placeholder="Search pre-registrations..."
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                className="h-8"
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Pre-registrations List */}
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {filteredPreRegistrations?.length === 0 ? (
                                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                                {searchQuery
                                                                    ? "No pre-registrations found"
                                                                    : "No pre-registrations available"
                                                                }
                                                            </div>
                                                        ) : (
                                                            filteredPreRegistrations?.map((preReg) => {
                                                                const user = preReg.relationships?.pilgrim?.relationships?.user?.attributes
                                                                const groupLeader = preReg.relationships?.groupLeader?.attributes
                                                                const isSelected = field.value === preReg.id.toString()

                                                                return (
                                                                    <div
                                                                        key={preReg.id}
                                                                        className={`flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 ${isSelected ? 'bg-accent' : ''
                                                                            }`}
                                                                        onClick={() => {
                                                                            setSelectedPreRegistration(preReg)
                                                                            field.onChange(preReg.id.toString())
                                                                            setIsSelectOpen(false)
                                                                            setSearchQuery('')

                                                                            // Auto-fill passport data if available
                                                                            const passport = preReg.relationships?.passport?.attributes
                                                                            const currentValues = form.getValues()
                                                                            form.reset({
                                                                                ...currentValues,
                                                                                pre_registration_id: preReg.id.toString(),
                                                                                passport_number: passport?.passportNumber || '',
                                                                                passport_type: passport?.passportType || 'ordinary',
                                                                                issue_date: passport?.issueDate ? passport.issueDate.split('T')[0] : '',
                                                                                expiry_date: passport?.expiryDate ? passport.expiryDate.split('T')[0] : '',
                                                                                passport_file: passport?.filePath || null,
                                                                                passport_notes: passport?.notes || '',
                                                                            })
                                                                        }}
                                                                    >
                                                                        <Avatar className="h-8 w-8">
                                                                            <AvatarImage src={user?.avatar} />
                                                                            <AvatarFallback className="text-xs">
                                                                                {getInitials(user?.firstName, user?.lastName)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="font-medium text-sm truncate">
                                                                                {user?.firstName} {user?.lastName}
                                                                            </div>
                                                                            <div className="text-xs text-muted-foreground truncate">
                                                                                NG-{preReg.attributes.serialNo}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="package_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Package</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select package" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {packages?.map((pkg) => (
                                                    <SelectItem key={pkg.id} value={pkg.id.toString()}>
                                                        {pkg.attributes.name} - ${pkg.attributes.price}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Bank and Registration Date in one row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="bank_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bank</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select bank" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {banks?.map((bank) => (
                                                    <SelectItem key={bank.id} value={bank.id.toString()}>
                                                        {bank.attributes.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Registration Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                className="w-full"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {!editingRegistration && (
                            <div className="border rounded-lg p-4 space-y-4 col-span-full">
                                <h3 className="text-lg font-semibold">Passport Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="passport_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Passport Number{!editingRegistration && ' *'}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter passport number"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="passport_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Passport Type{!editingRegistration && ' *'}</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="ordinary">Ordinary</SelectItem>
                                                        <SelectItem value="official">Official</SelectItem>
                                                        <SelectItem value="diplomatic">Diplomatic</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="issue_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Issue Date{!editingRegistration && ' *'}</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="expiry_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Expiry Date{!editingRegistration && ' *'}</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="passport_file"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Passport File</FormLabel>
                                                <FormControl>
                                                    <ImageUpload
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        accept="image/*,.pdf"
                                                        maxSize={5 * 1024 * 1024} // 5MB
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="passport_notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Notes</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Enter any additional notes about the passport..."
                                                        className="min-h-25"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editingRegistration ? 'Update' : 'Create')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}