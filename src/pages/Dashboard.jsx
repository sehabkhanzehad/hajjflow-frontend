import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CreateTransactionModal from '@/components/CreateTransactionModal'

export default function Dashboard() {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <CreateTransactionModal open={isModalOpen} onOpenChange={setIsModalOpen} />
            <DashboardLayout
                breadcrumbs={[
                    {
                        type: 'link',
                        text: t('app.home'),
                        href: '/',
                    },
                    {
                        type: 'page',
                        text: t('app.dashboard'),
                    },
                ]}
            >
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="aspect-video rounded-xl bg-muted/50" />
                    <div className="aspect-video rounded-xl bg-muted/50" />
                    <div className="aspect-video rounded-xl bg-muted/50" />
                </div>
                <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
            </DashboardLayout>
        </>
    )
}
