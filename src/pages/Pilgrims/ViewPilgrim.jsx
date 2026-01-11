import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useI18n } from '@/contexts/I18nContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import api from '@/lib/api'
import DashboardLayout from '@/Layouts/DashboardLayout'
import PageHeading from '@/components/PageHeading'
import { ViewUmrahPilgrimDetails } from './components/ViewUmrahPilgrimDetails'
import { ViewPreRegistrationPilgrimDetails } from './components/ViewPreRegistrationPilgrimDetails'
import { ViewRegistrationPilgrimDetails } from './components/ViewRegistrationPilgrimDetails'

export default function ViewPilgrim() {
    const { type, id } = useParams()
    const { t } = useI18n()

    const { data: pilgrimData, isLoading, error } = useQuery({
        queryKey: ['pilgrim', type, id],
        queryFn: async () => {
            const response = await api.get(`/pilgrims/${type}/${id}`)
            return response.data
        },
    })

    console.log('Pilgrim Data:', pilgrimData)

    const pilgrimType = pilgrimData?.pilgrim_type

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-5 w-32" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-16 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    const getPilgrimTitle = () => {
        switch (pilgrimType) {
            case 'pre-registration':
                return t({ en: 'Pre-Registration Details', bn: 'প্রি-রেজিস্ট্রেশন বিস্তারিত' })
            case 'umrah':
                return t({ en: 'Umrah Pilgrim Details', bn: 'উমরাহ পিলগ্রিম বিস্তারিত' })
            case 'registration':
                return t({ en: 'Hajj Registration Details', bn: 'হজ রেজিস্ট্রেশন বিস্তারিত' })
            default:
                return t({ en: 'Pilgrim Details', bn: 'পিলগ্রিম বিস্তারিত' })
        }
    }

    return (
        <DashboardLayout>
            <PageHeading title={getPilgrimTitle()} />

            <div className="space-y-6">
                {pilgrimType === 'umrah' && (
                    <ViewUmrahPilgrimDetails pilgrimData={pilgrimData} />
                )}

                {pilgrimType === 'pre-registration' && (
                    <ViewPreRegistrationPilgrimDetails pilgrimData={pilgrim} pilgrimType={pilgrimType} />
                )}

                {pilgrimType === 'registration' && (
                    <ViewRegistrationPilgrimDetails pilgrimData={pilgrim} pilgrimType={pilgrimType} />
                )}
            </div>
        </DashboardLayout>
    )
}