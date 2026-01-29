import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useI18n } from '@/contexts/I18nContext'

const transferPreRegistrationSchema = z.object({
    transfer_date: z.string().min(1, "Transfer date is required"),
    note: z.string().min(1, "Note is required").max(400, "Note must be less than 400 characters"),
})

export function TransferPreRegistrationModal({ open, onOpenChange, onSubmit, isSubmitting }) {
    const { t, language } = useI18n()

    const form = useForm({
        resolver: zodResolver(transferPreRegistrationSchema),
        defaultValues: {
            transfer_date: '',
            note: '',
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({
                transfer_date: new Date().toISOString().split('T')[0], // Default to today
                note: '',
            })
        }
    }, [open, form])

    const handleSubmit = (data) => {
        onSubmit(data)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className={language === 'bn' ? 'font-bengali' : ''}>
                        {t({ en: 'Transfer Pre-Registration', bn: 'প্রি-রেজিস্ট্রেশন ট্রান্সফার করুন' })}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="transfer_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'Transfer Date', bn: 'ট্রান্সফারের তারিখ' })} *</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} className={language === 'bn' ? 'font-bengali' : ''} />
                                    </FormControl>
                                    <FormMessage className={language === 'bn' ? 'font-bengali' : ''} />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'Note', bn: 'নোট' })} *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder={t({ en: 'Enter transfer note', bn: 'ট্রান্সফার নোট লিখুন' })}
                                            className={language === 'bn' ? 'font-bengali' : ''}
                                            rows={4}
                                        />
                                    </FormControl>
                                    <FormMessage className={language === 'bn' ? 'font-bengali' : ''} />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                                className={language === 'bn' ? 'font-bengali' : ''}
                            >
                                {t({ en: 'Cancel', bn: 'বাতিল' })}
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className={language === 'bn' ? 'font-bengali' : ''}>
                                {isSubmitting ? t({ en: 'Transferring...', bn: 'ট্রান্সফার হচ্ছে...' }) : t({ en: 'Transfer Pre-Registration', bn: 'প্রি-রেজিস্ট্রেশন ট্রান্সফার করুন' })}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}