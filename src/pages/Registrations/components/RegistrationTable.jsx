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

export function RegistrationTable({ registrations, onEdit, onDelete }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Pilgrim Name</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Passport Number</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {registrations?.map((registration) => (
                    <TableRow key={registration.id}>
                        <TableCell>
                            {registration.relationships?.pilgrim?.relationships?.user?.attributes?.firstName} {registration.relationships?.pilgrim?.relationships?.user?.attributes?.lastName}
                        </TableCell>
                        <TableCell>{registration.relationships?.package?.attributes?.name}</TableCell>
                        <TableCell>{registration.relationships?.bank?.attributes?.name}</TableCell>
                        <TableCell>{registration.attributes.passportNumber}</TableCell>
                        <TableCell>
                            {registration.attributes.passportExpiryDate ? new Date(registration.attributes.passportExpiryDate).toLocaleDateString('en-GB') : '-'}
                        </TableCell>
                        <TableCell>{new Date(registration.attributes.date).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${registration.attributes.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : registration.attributes.status === 'completed'
                                        ? 'bg-blue-100 text-blue-800'
                                        : registration.attributes.status === 'cancelled'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {registration.attributes.status}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center justify-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="data-[state=open]:bg-accent bg-background hover:bg-accent ml-auto cursor-pointer rounded-md border p-1">
                                            <EllipsisVertical size={15} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(registration)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onDelete(registration)} className="text-destructive">
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