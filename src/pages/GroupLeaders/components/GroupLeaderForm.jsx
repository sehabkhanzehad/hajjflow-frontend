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
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const groupLeaderSchema = z.object({
    code: z.string().min(1, "Code is required"),
    description: z.string().optional(),
    group_name: z.string().optional(),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().optional(),
    mother_name: z.string().optional(),
    father_name: z.string().optional(),
    phone: z.string().min(1, "Phone is required"),
    gender: z.enum(["male", "female", "other"], {
        required_error: "Please select a gender",
    }),
})

export function GroupLeaderForm({ open, onOpenChange, editingGroupLeader, onSubmit, isSubmitting }) {
    const form = useForm({
        resolver: zodResolver(groupLeaderSchema),
        defaultValues: {
            code: '',
            description: '',
            group_name: '',
            first_name: '',
            last_name: '',
            mother_name: '',
            father_name: '',
            phone: '',
            gender: '',
        },
    })

    // Reset form when dialog opens/closes or editing changes
    useEffect(() => {
        if (editingGroupLeader) {
            // Editing existing - populate with data
            form.reset({
                code: editingGroupLeader.attributes.code,
                description: editingGroupLeader.attributes.description || '',
                group_name: editingGroupLeader.relationships?.groupLeader?.attributes?.groupName || '',
                first_name: editingGroupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.firstName || '',
                last_name: editingGroupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.lastName || '',
                mother_name: editingGroupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.motherName || '',
                father_name: editingGroupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.fatherName || '',
                phone: editingGroupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.phone || '',
                gender: editingGroupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.gender || '',
            })
        } else if (open) {
            // Creating new - reset to empty
            form.reset({
                code: '',
                description: '',
                group_name: '',
                first_name: '',
                last_name: '',
                mother_name: '',
                father_name: '',
                phone: '',
                gender: '',
            })
        }
    }, [editingGroupLeader, open, form])

    const handleSubmit = (data) => {
        onSubmit(data, editingGroupLeader)
    }

    const handleOpenChange = (newOpen) => {
        if (!newOpen) {
            form.reset()
        } else if (newOpen && editingGroupLeader) {
            // Populate form when opening for edit
            form.reset({
                code: editingGroupLeader.attributes.code,
                description: editingGroupLeader.attributes.description || '',
                group_name: editingGroupLeader.relationships?.groupLeader?.attributes?.groupName || '',
                first_name: editingGroupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.firstName || '',
                last_name: editingGroupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.lastName || '',
                mother_name: editingGroupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.motherName || '',
                father_name: editingGroupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.fatherName || '',
                phone: editingGroupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.phone || '',
                gender: editingGroupLeader.relationships?.groupLeader?.relationships?.profile?.attributes?.gender || '',
            })
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-xl font-semibold">
                        {editingGroupLeader ? 'Edit Group Leader' : 'Add Group Leader'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {editingGroupLeader ? 'Update the group leader details.' : 'Create a new group leader section.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground capitalize">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Code</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter group leader code"
                                                    {...field}
                                                    className="h-9"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="group_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Group Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter group name"
                                                    {...field}
                                                    className="h-9"
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
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter description"
                                                {...field}
                                                className="min-h-15 resize-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Pilgrim Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground capitalize">Pilgrim Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter first name"
                                                    {...field}
                                                    className="h-9"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="last_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter last name"
                                                    {...field}
                                                    className="h-9"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="mother_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mother Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter mother name"
                                                    {...field}
                                                    className="h-9"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="father_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Father Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter father name"
                                                    {...field}
                                                    className="h-9"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter phone number"
                                                    {...field}
                                                    className="h-9"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-9 w-full">
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
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editingGroupLeader ? 'Update' : 'Create')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}