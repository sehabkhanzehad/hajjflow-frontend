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

export function PreRegistrationTable({ preRegistrations, onEdit, onDelete }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Serial No</TableHead>
                    <TableHead>Pilgrim Name</TableHead>
                    <TableHead>Group Leader</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {preRegistrations?.map((preRegistration) => (
                    <TableRow key={preRegistration.id}>
                        <TableCell>{preRegistration.attributes.serialNo}</TableCell>
                        <TableCell>
                            {preRegistration.relationships?.pilgrim?.relationships?.user?.attributes?.firstName} {preRegistration.relationships?.pilgrim?.relationships?.user?.attributes?.lastName}
                        </TableCell>
                        <TableCell>{preRegistration.relationships?.groupLeader?.attributes?.groupName}</TableCell>
                        <TableCell>{preRegistration.relationships?.bank?.attributes?.name}</TableCell>
                        <TableCell>{new Date(preRegistration.attributes.date).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell>{preRegistration.attributes.status}</TableCell>
                        <TableCell>
                            <div className="flex items-center justify-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="data-[state=open]:bg-accent bg-background hover:bg-accent ml-auto cursor-pointer rounded-md border p-1">
                                            <EllipsisVertical size={15} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(preRegistration)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onDelete(preRegistration)} className="text-destructive">
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