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
import { Badge } from "@/components/ui/badge"
import { EllipsisVertical, Users } from "lucide-react"

export function PackageTable({ packages, onEdit, onDelete }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Package Details</TableHead>
                    <TableHead>Duration & Dates</TableHead>
                    <TableHead>Total Pilgrims</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {packages?.map((pkg) => (
                    <TableRow key={pkg.id}>
                        <TableCell>
                            <div className="space-y-1">
                                <div className="font-medium text-sm">
                                    {pkg.attributes.name}
                                </div>
                                <div className="font-semibold text-green-600">
                                    ৳{parseFloat(pkg.attributes.price).toLocaleString()}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="space-y-1">
                                <div className="text-sm font-medium">
                                    {pkg.attributes.duration_days ? `${pkg.attributes.duration_days} days` : '-'}
                                </div>
                                {pkg.attributes.start_date && pkg.attributes.end_date && (
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(pkg.attributes.start_date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })} - {new Date(pkg.attributes.end_date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                    {pkg.attributes.statistics.total_pilgrims}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={pkg.attributes.status ? "default" : "secondary"}>
                                {pkg.attributes.status ? 'Active' : 'Inactive'}
                            </Badge>
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
                                        <DropdownMenuItem onClick={() => onEdit(pkg)}>
                                            Edit Package
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onDelete(pkg)} className="text-destructive">
                                            Delete Package
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