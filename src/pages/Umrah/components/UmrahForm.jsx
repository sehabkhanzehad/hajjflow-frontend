import { useEffect, useState } from 'react'
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
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

const umrahSchema = z.object({
    group_leader_id: z.string().min(1, "Group leader is required"),
    pilgrim_type: z.enum(['existing', 'new']).optional(),
    pilgrim_id: z.string().optional(),
    new_pilgrim: z.object({
        first_name: z.string(),
        last_name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        gender: z.enum(['male', 'female', 'other']),
        is_married: z.boolean().optional(),
        nid: z.string().optional(),
        date_of_birth: z.string().optional(),
    }).optional(),
    package_id: z.string().min(1, "Package is required"),
}).superRefine((data, ctx) => {
    const pilgrimType = data.pilgrim_type || 'existing'
    
    if (pilgrimType === 'existing') {
        if (!data.pilgrim_id || data.pilgrim_id.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select an existing pilgrim",
                path: ["pilgrim_id"]
            })
        }
    } else if (pilgrimType === 'new') {
        if (!data.new_pilgrim) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please fill in new pilgrim details",
                path: ["new_pilgrim", "first_name"]
            })
        } else {
            if (!data.new_pilgrim.first_name || data.new_pilgrim.first_name.trim().length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "First name is required",
                    path: ["new_pilgrim", "first_name"]
                })
            }
            if (!data.new_pilgrim.gender) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Gender is required",
                    path: ["new_pilgrim", "gender"]
                })
            }
        }
    }
})

export function UmrahForm({ open, onOpenChange, editingUmrah, onSubmit, isSubmitting, packages, groupLeaders, pilgrims }) {
    const [pilgrimType, setPilgrimType] = useState('existing')

    const form = useForm({
        resolver: zodResolver(umrahSchema),
        defaultValues: {
            group_leader_id: '',
            pilgrim_type: 'existing',
            pilgrim_id: '',
            new_pilgrim: {
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                gender: 'male',
                is_married: false,
                nid: '',
                date_of_birth: '',
            },
            package_id: '',
        }
    })

    useEffect(() => {
        if (open) {
            setPilgrimType('existing') // Reset pilgrim type state
            if (editingUmrah) {
                form.reset({
                    group_leader_id: editingUmrah.relationships?.groupLeader?.id?.toString() || '',
                    pilgrim_type: 'existing',
                    pilgrim_id: editingUmrah.relationships?.pilgrim?.id?.toString() || '',
                    package_id: editingUmrah.relationships?.package?.id?.toString() || '',
                })
            } else {
                form.reset({
                    group_leader_id: '',
                    pilgrim_type: 'existing',
                    pilgrim_id: '',
                    new_pilgrim: {
                        first_name: '',
                        last_name: '',
                        email: '',
                        phone: '',
                        gender: 'male',
                        is_married: false,
                        nid: '',
                        date_of_birth: '',
                    },
                    package_id: '',
                })
            }
        }
    }, [editingUmrah, form, open])

    const handlePilgrimTypeChange = (value) => {
        setPilgrimType(value)
        form.setValue('pilgrim_type', value)
        
        // Clear validation errors when switching pilgrim type
        if (value === 'existing') {
            form.clearErrors(['new_pilgrim', 'new_pilgrim.first_name', 'new_pilgrim.gender'])
        } else if (value === 'new') {
            form.clearErrors('pilgrim_id')
        }
    }

    const handleFormSubmit = (data) => {
        const submitData = {
            group_leader_id: data.group_leader_id,
            package_id: data.package_id,
        }

        // For editing, pilgrim_type is not in the form, so we assume existing pilgrim
        const pilgrimType = data.pilgrim_type || 'existing'

        if (pilgrimType === 'existing') {
            submitData.pilgrim_id = data.pilgrim_id
        } else {
            submitData.new_pilgrim = data.new_pilgrim
        }

        onSubmit(submitData)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editingUmrah ? 'Edit Umrah' : 'Create Umrah'}
                    </DialogTitle>
                    <DialogDescription>
                        {editingUmrah ? 'Update the umrah information.' : 'Fill in the details to create a new umrah registration.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                        {Object.keys(form.formState.errors).length > 0 && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-800 font-medium">Please fix the following errors:</p>
                                <ul className="mt-2 text-red-700 text-sm">
                                    {Object.entries(form.formState.errors).map(([key, error]) => (
                                        <li key={key}>• {error.message}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="group_leader_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Group Leader</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select group leader" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {groupLeaders?.map((leader) => (
                                                    <SelectItem key={leader.id} value={leader.id.toString()}>
                                                        {leader.attributes.groupName}
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

                        {!editingUmrah && (
                            <FormField
                                control={form.control}
                                name="pilgrim_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pilgrim Type</FormLabel>
                                        <Select onValueChange={handlePilgrimTypeChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select pilgrim type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="existing">Existing Pilgrim</SelectItem>
                                                <SelectItem value="new">New Pilgrim</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {pilgrimType === 'existing' || editingUmrah ? (
                            <FormField
                                control={form.control}
                                name="pilgrim_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pilgrim</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select pilgrim" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {pilgrims?.map((pilgrim) => (
                                                    <SelectItem key={pilgrim.id} value={pilgrim.id.toString()}>
                                                        {pilgrim.attributes.firstName} {pilgrim.attributes.lastName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="new_pilgrim.first_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter first name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="new_pilgrim.last_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter last name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="new_pilgrim.email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="Enter email address" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="new_pilgrim.phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter phone number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="new_pilgrim.gender"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Gender *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select gender" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="new_pilgrim.is_married"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Married</FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="new_pilgrim.nid"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>NID</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter NID number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="new_pilgrim.date_of_birth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date of Birth</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                            </div>
                        )}

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editingUmrah ? 'Update' : 'Create')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}