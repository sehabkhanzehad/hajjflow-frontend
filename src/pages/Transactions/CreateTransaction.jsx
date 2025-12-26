import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import api from '@/lib/api'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const transactionSchema = z.object({
    section_id: z.string().min(1, 'Section is required'),
    type: z.enum(['income', 'expense']),
    voucher_no: z.string().optional(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    amount: z.string().min(1, 'Amount is required'),
    date: z.string().min(1, 'Date is required'),
    loan_id: z.string().optional(),
    pre_registration_ids: z.array(z.string()).optional(),
    registration_ids: z.array(z.string()).optional(),
})

export default function CreateTransaction() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [selectedSection, setSelectedSection] = useState(null)

    const form = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            section_id: '',
            type: 'income',
            voucher_no: '',
            title: '',
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            loan_id: '',
            pre_registration_ids: [],
            registration_ids: [],
        }
    })

    const { data: sections } = useQuery({
        queryKey: ['sections'],
        queryFn: async () => {
            const response = await api.get('/sections')
            return response.data.data
        }
    })

    const { data: loans } = useQuery({
        queryKey: ['transaction-loans'],
        queryFn: async () => {
            const response = await api.get('/transactions/loans')
            return response.data.data
        }
    })

    const { data: preRegistrations } = useQuery({
        queryKey: ['transaction-pre-registrations'],
        queryFn: async () => {
            const response = await api.get('/transactions/pre-registrations')
            return response.data.data
        }
    })

    const { data: registrations } = useQuery({
        queryKey: ['transaction-registrations'],
        queryFn: async () => {
            const response = await api.get('/transactions/registrations')
            return response.data.data
        }
    })

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/transactions', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            toast.success('Transaction created successfully')
            navigate('/transactions')
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to create transaction')
        }
    })

    const onSubmit = (data) => {
        // Convert amount to number
        data.amount = parseFloat(data.amount)

        // Clean up empty values
        if (!data.loan_id) delete data.loan_id
        if (data.pre_registration_ids && data.pre_registration_ids.length === 0) delete data.pre_registration_ids
        if (data.registration_ids && data.registration_ids.length === 0) delete data.registration_ids

        createMutation.mutate(data)
    }

    const watchedSectionId = form.watch('section_id')

    useEffect(() => {
        if (watchedSectionId && sections) {
            const section = sections.find(s => s.id.toString() === watchedSectionId)
            setSelectedSection(section)
        }
    }, [watchedSectionId, sections])

    return (
        <DashboardLayout
            breadcrumbs={[
                { type: 'link', text: t('app.home'), href: '/' },
                { type: 'link', text: t('app.dashboard'), href: '/dashboard' },
                { type: 'link', text: 'Transactions', href: '/transactions' },
                { type: 'page', text: 'Create Transaction' },
            ]}
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link to="/transactions">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Transactions
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Create Transaction</h1>
                        <p className="text-muted-foreground">Add a new transaction to the system</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Transaction Details</CardTitle>
                        <CardDescription>Fill in the information below to create a new transaction</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="section_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Section *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select section" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {sections?.map((section) => (
                                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                                {section.attributes.name}
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
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="income">Income</SelectItem>
                                                        <SelectItem value="expense">Expense</SelectItem>
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
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter transaction title" {...field} />
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
                                                <FormLabel>Amount *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date *</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="voucher_no"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Voucher Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Optional" {...field} />
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
                                                    placeholder="Enter transaction description (optional)"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Conditional reference fields based on section type */}
                                {selectedSection && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">References</h3>

                                        {(selectedSection.attributes.type === 'lend' || selectedSection.attributes.type === 'borrow') && loans && (
                                            <FormField
                                                control={form.control}
                                                name="loan_id"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Loan</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select a loan" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {loans.map((loan) => (
                                                                    <SelectItem key={loan.id} value={loan.id.toString()}>
                                                                        {loan.attributes.title}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        {selectedSection.attributes.type === 'pre_registration' && preRegistrations && (
                                            <FormField
                                                control={form.control}
                                                name="pre_registration_ids"
                                                render={() => (
                                                    <FormItem>
                                                        <FormLabel>Pre-registrations</FormLabel>
                                                        <div className="space-y-2">
                                                            {preRegistrations.map((pr) => (
                                                                <FormField
                                                                    key={pr.id}
                                                                    control={form.control}
                                                                    name="pre_registration_ids"
                                                                    render={({ field }) => (
                                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                            <FormControl>
                                                                                <Checkbox
                                                                                    checked={field.value?.includes(pr.id.toString())}
                                                                                    onCheckedChange={(checked) => {
                                                                                        return checked
                                                                                            ? field.onChange([...field.value, pr.id.toString()])
                                                                                            : field.onChange(field.value?.filter((value) => value !== pr.id.toString()))
                                                                                    }}
                                                                                />
                                                                            </FormControl>
                                                                            <FormLabel className="font-normal">
                                                                                {pr.attributes.serialNo} - {pr.relationships?.pilgrim?.attributes?.name}
                                                                            </FormLabel>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        {selectedSection.attributes.type === 'registration' && registrations && (
                                            <FormField
                                                control={form.control}
                                                name="registration_ids"
                                                render={() => (
                                                    <FormItem>
                                                        <FormLabel>Registrations</FormLabel>
                                                        <div className="space-y-2">
                                                            {registrations.map((reg) => (
                                                                <FormField
                                                                    key={reg.id}
                                                                    control={form.control}
                                                                    name="registration_ids"
                                                                    render={({ field }) => (
                                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                            <FormControl>
                                                                                <Checkbox
                                                                                    checked={field.value?.includes(reg.id.toString())}
                                                                                    onCheckedChange={(checked) => {
                                                                                        return checked
                                                                                            ? field.onChange([...field.value, reg.id.toString()])
                                                                                            : field.onChange(field.value?.filter((value) => value !== reg.id.toString()))
                                                                                    }}
                                                                                />
                                                                            </FormControl>
                                                                            <FormLabel className="font-normal">
                                                                                {reg.attributes.serialNo} - {reg.relationships?.pilgrim?.attributes?.name}
                                                                            </FormLabel>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-end gap-4">
                                    <Link to="/transactions">
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={createMutation.isPending}>
                                        {createMutation.isPending ? 'Creating...' : 'Create Transaction'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
