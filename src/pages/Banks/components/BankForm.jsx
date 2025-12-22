import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export function BankForm({ open, onOpenChange, editingBank, formData, onFormDataChange, onSubmit, isSubmitting }) {
    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-xl font-semibold">{editingBank ? 'Edit Bank' : 'Add Bank'}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {editingBank ? 'Update the bank details.' : 'Create a new bank section.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground capitalize">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="code" className="text-sm font-medium">Code</Label>
                                    <Input
                                        id="code"
                                        placeholder="Enter bank code"
                                        value={formData.code}
                                        onChange={(e) => onFormDataChange({ ...formData, code: e.target.value })}
                                        required
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter bank name"
                                        value={formData.name}
                                        onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                                        required
                                        className="h-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Enter bank description"
                                    value={formData.description}
                                    onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                                    className="min-h-[60px] resize-none"
                                />
                            </div>
                        </div>

                        {!editingBank && (
                            <>
                                {/* Bank Details */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground capitalize">Bank Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="branch" className="text-sm font-medium">Branch</Label>
                                            <Input
                                                id="branch"
                                                placeholder="Enter branch name"
                                                value={formData.branch}
                                                onChange={(e) => onFormDataChange({ ...formData, branch: e.target.value })}
                                                required
                                                className="h-9"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="account_number" className="text-sm font-medium">Account Number</Label>
                                            <Input
                                                id="account_number"
                                                placeholder="Enter account number"
                                                value={formData.account_number}
                                                onChange={(e) => onFormDataChange({ ...formData, account_number: e.target.value })}
                                                required
                                                className="h-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="account_holder_name" className="text-sm font-medium">Account Holder Name</Label>
                                        <Input
                                            id="account_holder_name"
                                            placeholder="Enter account holder name"
                                            value={formData.account_holder_name}
                                            onChange={(e) => onFormDataChange({ ...formData, account_holder_name: e.target.value })}
                                            required
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                                        <Textarea
                                            id="address"
                                            placeholder="Enter bank address"
                                            value={formData.address}
                                            onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
                                            required
                                            className="min-h-[60px] resize-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="account_type" className="text-sm font-medium">Account Type</Label>
                                            <Select value={formData.account_type} onValueChange={(value) => onFormDataChange({ ...formData, account_type: value })}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select account type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="current">Current</SelectItem>
                                                    <SelectItem value="savings">Savings</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="routing_number" className="text-sm font-medium">Routing Number</Label>
                                            <Input
                                                id="routing_number"
                                                placeholder="Enter routing number"
                                                value={formData.routing_number}
                                                onChange={(e) => onFormDataChange({ ...formData, routing_number: e.target.value })}
                                                className="h-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="swift_code" className="text-sm font-medium">SWIFT Code</Label>
                                            <Input
                                                id="swift_code"
                                                placeholder="Enter SWIFT code"
                                                value={formData.swift_code}
                                                onChange={(e) => onFormDataChange({ ...formData, swift_code: e.target.value })}
                                                className="h-9"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="opening_date" className="text-sm font-medium">Opening Date</Label>
                                            <Input
                                                id="opening_date"
                                                type="date"
                                                value={formData.opening_date}
                                                onChange={(e) => onFormDataChange({ ...formData, opening_date: e.target.value })}
                                                className="h-9"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground capitalize">Contact Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                                            <Input
                                                id="phone"
                                                placeholder="Enter phone number"
                                                value={formData.phone}
                                                onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
                                                className="h-9"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="telephone" className="text-sm font-medium">Telephone</Label>
                                            <Input
                                                id="telephone"
                                                placeholder="Enter telephone number"
                                                value={formData.telephone}
                                                onChange={(e) => onFormDataChange({ ...formData, telephone: e.target.value })}
                                                className="h-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter email address"
                                                value={formData.email}
                                                onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
                                                className="h-9"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                                            <Input
                                                id="website"
                                                placeholder="Enter website URL"
                                                value={formData.website}
                                                onChange={(e) => onFormDataChange({ ...formData, website: e.target.value })}
                                                className="h-9"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter className="pt-8">
                        <Button type="submit" disabled={isSubmitting} className="px-8">
                            {isSubmitting ? 'Saving...' : (editingBank ? 'Update Bank' : 'Create Bank')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}