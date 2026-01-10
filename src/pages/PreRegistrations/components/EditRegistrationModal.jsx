import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useI18n } from '@/contexts/I18nContext'
import api from '@/lib/api'

const registrationSchema = z.object({
    bank_id: z.string().min(1, "Bank is required"),
    serial_no: z.string().min(1, "Serial number is required"),
    tracking_no: z.string().min(1, "Tracking number is required"),
    bank_voucher_no: z.string().min(1, "Bank voucher number is required"),
    voucher_name: z.string().min(1, "Voucher name is required"),
    date: z.string().min(1, "Date is required"),
})

export function EditRegistrationModal({ open, onOpenChange, registrationData, onSubmit, isSubmitting }) {
    const { t } = useI18n()

    // Fetch banks for dropdown
    const { data: banks } = useQuery({
        queryKey: ['pre-registration-banks'],
        queryFn: () => api.get('/pre-registrations/banks').then(res => res.data.data),
    })

    const form = useForm({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            bank_id: '',
            serial_no: '',
            tracking_no: '',
            bank_voucher_no: '',
            voucher_name: '',
            date: '',
        },
    })

    useEffect(() => {
        if (registrationData && open) {
            form.reset({
                bank_id: registrationData.relationships?.bank?.id?.toString() || '',
                serial_no: registrationData.attributes?.serialNo || '',
                tracking_no: registrationData.attributes?.trackingNo || '',
                bank_voucher_no: registrationData.attributes?.bankVoucherNo || '',
                voucher_name: registrationData.attributes?.voucherName || '',
                date: registrationData.attributes?.date ? new Date(registrationData.attributes.date).toISOString().split('T')[0] : '',
            })
        }
    }, [registrationData, open, form])

    const handleSubmit = (data) => {
        onSubmit(data)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {t({ en: 'Edit Registration Details', bn: 'রেজিস্ট্রেশন বিস্তারিত এডিট করুন' })}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="bank_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: 'Bank', bn: 'ব্যাংক' })} *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={t({ en: 'Select bank', bn: 'ব্যাংক নির্বাচন করুন' })} />
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
                                name="serial_no"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: 'Serial No', bn: 'সিরিয়াল নং' })} *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tracking_no"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: 'Tracking No', bn: 'ট্র্যাকিং নং' })} *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bank_voucher_no"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: 'Bank Voucher No', bn: 'ব্যাংক ভাউচার নং' })} *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="voucher_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: 'Voucher Name', bn: 'ভাউচার নাম' })} *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
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
                                        <FormLabel>{t({ en: 'Date', bn: 'তারিখ' })} *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                {t({ en: 'Cancel', bn: 'বাতিল' })}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? t({ en: 'Updating...', bn: 'আপডেট হচ্ছে...' }) : t({ en: 'Update', bn: 'আপডেট' })}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}