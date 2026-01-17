import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ManagementGroupLeaderTable({ groupLeaders }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Leader Info</TableHead>
                    <TableHead>Group Name</TableHead>
                    <TableHead className="text-center">Pre Reg</TableHead>
                    <TableHead className="text-center">Registration</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {groupLeaders?.map((groupLeader) => (
                    <TableRow key={groupLeader.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={groupLeader.relationships?.user?.attributes?.avatar} />
                                    <AvatarFallback>
                                        {groupLeader.relationships?.user?.attributes?.firstName?.[0] || ''}
                                        {groupLeader.relationships?.user?.attributes?.lastName?.[0] || ''}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">
                                        {groupLeader.relationships?.user?.attributes?.firstName} {groupLeader.relationships?.user?.attributes?.lastName}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {groupLeader.relationships?.user?.attributes?.phone || '-'}
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="font-medium">
                            {groupLeader.attributes.groupName}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                            {groupLeader.attributes.preRegistrationsCount || 0}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                            {groupLeader.attributes.registrationsCount || 0}
                        </TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                groupLeader.attributes.status
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {groupLeader.attributes.status ? 'Active' : 'Inactive'}
                            </span>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}