import { useEffect } from 'react'
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

const registrationSchema = z.object({
    pre_registration_id: z.string().min(1, "Pre-registration is required"),
    package_id: z.string().min(1, "Package is required"),
    bank_id: z.string().min(1, "Bank is required"),
    passport_number: z.string().min(1, "Passport number is required"),
    passport_expiry_date: z.string().min(1, "Passport expiry date is required"),
    date: z.string().min(1, "Registration date is required"),
    status: z.string().optional(),
})

export function RegistrationForm({ open, onOpenChange, editingRegistration, onSubmit, isSubmitting, preRegistrations, packages, banks }) {
    const form = useForm({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            pre_registration_id: '',
            package_id: '',
            bank_id: '',
            passport_number: '',
            passport_expiry_date: '',
            date: new Date().toISOString().split('T')[0],
            status: 'active',
        }
    })

    useEffect(() => {
        if (editingRegistration) {
            form.reset({
                pre_registration_id: editingRegistration.relationships?.preRegistration?.id?.toString() || '',
                package_id: editingRegistration.relationships?.package?.id?.toString() || '',
                bank_id: editingRegistration.relationships?.bank?.id?.toString() || '',
                passport_number: editingRegistration.attributes.passportNumber || '',
                passport_expiry_date: editingRegistration.attributes.passportExpiryDate ? new Date(editingRegistration.attributes.passportExpiryDate).toISOString().split('T')[0] : '',
                date: editingRegistration.attributes.date ? new Date(editingRegistration.attributes.date).toISOString().split('T')[0] : '',
                status: editingRegistration.attributes.status || 'active',
            })
        } else {
            form.reset({
                pre_registration_id: '',
                package_id: '',
                bank_id: '',
                passport_number: '',
                passport_expiry_date: '',
                date: new Date().toISOString().split('T')[0],
                status: 'active',
            })
        }
    }, [editingRegistration, form])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editingRegistration ? 'Edit Registration' : 'Create Registration'}
                    </DialogTitle>
                    <DialogDescription>
                        {editingRegistration ? 'Update the registration information.' : 'Fill in the details to create a new registration.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="pre_registration_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pre-registration</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select pre-registration" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {preRegistrations?.map((preReg) => (
                                                    <SelectItem key={preReg.id} value={preReg.id.toString()}>
                                                        {preReg.attributes.serialNo} - {preReg.relationships?.pilgrim?.relationships?.user?.attributes?.firstName} {preReg.relationships?.pilgrim?.relationships?.user?.attributes?.lastName}
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                name="passport_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Passport Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter passport number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="passport_expiry_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Passport Expiry Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
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
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {editingRegistration && (
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                                <SelectItem value="transferred">Transferred</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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