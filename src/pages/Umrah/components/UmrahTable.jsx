import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EllipsisVertical } from "lucide-react"

export function UmrahTable({ umrahs, onEdit, onDelete }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Pilgrim Name</TableHead>
                    <TableHead>Group Leader</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {umrahs?.map((umrah) => (
                    <TableRow key={umrah.id}>
                        <TableCell>
                            {umrah.relationships?.pilgrim?.relationships?.user?.attributes?.firstName} {umrah.relationships?.pilgrim?.relationships?.user?.attributes?.lastName}
                        </TableCell>
                        <TableCell>{umrah.relationships?.groupLeader?.attributes?.groupName}</TableCell>
                        <TableCell>{umrah.relationships?.package?.attributes?.name}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${umrah.attributes.status === 'confirmed'
                                    ? 'bg-green-100 text-green-800'
                                    : umrah.attributes.status === 'completed'
                                        ? 'bg-blue-100 text-blue-800'
                                        : umrah.attributes.status === 'cancelled'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {umrah.attributes.status}
                            </span>
                        </TableCell>
                        <TableCell>{new Date(umrah.attributes.createdAt).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell>
                            <div className="flex items-center justify-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="data-[state=open]:bg-accent bg-background hover:bg-accent ml-auto cursor-pointer rounded-md border p-1">
                                            <EllipsisVertical size={15} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(umrah)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onDelete(umrah)} className="text-destructive">
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}