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
import { Button } from "@/components/ui/button"
import { useI18n } from '@/contexts/I18nContext'

const cancelPreRegistrationSchema = z.object({
    cancel_date: z.string().min(1, "Cancel date is required"),
})

export function CancelPreRegistrationModal({ open, onOpenChange, onSubmit, isSubmitting }) {
    const { t, language } = useI18n()

    const form = useForm({
        resolver: zodResolver(cancelPreRegistrationSchema),
        defaultValues: {
            cancel_date: '',
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({
                cancel_date: new Date().toISOString().split('T')[0], // Default to today
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
                        {t({ en: 'Cancel Pre-Registration', bn: 'প্রি-রেজিস্ট্রেশন বাতিল করুন' })}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="cancel_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'Cancel Date', bn: 'বাতিলের তারিখ' })} *</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} className={language === 'bn' ? 'font-bengali' : ''} />
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
                            <Button 
                            type="submit" 
                            disabled={isSubmitting} variant="destructive" className={language === 'bn' ? 'font-bengali' : ''}>
                                {isSubmitting ? t({ en: 'Cancelling...', bn: 'বাতিল হচ্ছে...' }) : t({ en: 'Cancel Pre-Registration', bn: 'প্রি-রেজিস্ট্রেশন বাতিল করুন' })}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}