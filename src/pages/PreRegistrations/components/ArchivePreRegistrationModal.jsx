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

const archivePreRegistrationSchema = z.object({
    archive_date: z.string().min(1, "Archive date is required"),
})

export function ArchivePreRegistrationModal({ open, onOpenChange, onSubmit, isSubmitting }) {
    const { t, language } = useI18n()

    const form = useForm({
        resolver: zodResolver(archivePreRegistrationSchema),
        defaultValues: {
            archive_date: '',
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({
                archive_date: new Date().toISOString().split('T')[0], // Default to today
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
                        {t({ en: 'Archive Pre-Registration', bn: 'প্রি-রেজিস্ট্রেশন আর্কাইভ করুন' })}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="archive_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'Archive Date', bn: 'আর্কাইভের তারিখ' })} *</FormLabel>
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
                            <Button type="submit" disabled={isSubmitting} className={language === 'bn' ? 'font-bengali' : ''}>
                                {isSubmitting ? t({ en: 'Archiving...', bn: 'আর্কাইভ হচ্ছে...' }) : t({ en: 'Archive Pre-Registration', bn: 'প্রি-রেজিস্ট্রেশন আর্কাইভ করুন' })}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}