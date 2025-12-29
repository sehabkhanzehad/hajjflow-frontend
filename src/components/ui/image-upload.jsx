import { cn } from '@/lib/utils';
import { Upload, X } from 'lucide-react';
import * as React from 'react';
import { useRef, useState } from 'react';

const ImageUpload = React.forwardRef(
    (
        {
            className,
            value,
            onChange,
            onRemove,
            maxSize = 5, // Max size in MB
            accept = 'image/*',
            disabled = false,
            ...props
        },
        ref
    ) => {
        const [preview, setPreview] = useState(value || null);
        const [error, setError] = useState('');
        const [isDragging, setIsDragging] = useState(false);
        const fileInputRef = useRef(null);

        const handleFileChange = (file) => {
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file');
                return;
            }

            if (file.size > maxSize * 1024 * 1024) {
                setError(`File size must be less than ${maxSize}MB`);
                return;
            }

            setError('');
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);

            if (onChange) onChange(file);
        };

        const handleInputChange = (e) => {
            handleFileChange(e.target.files?.[0]);
        };

        const handleRemove = (e) => {
            e.stopPropagation();
            setPreview(null);
            setError('');
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (onRemove) onRemove();
        };

        const handleClick = () => {
            fileInputRef.current?.click();

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };

        const handleDragEnter = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) {
                setIsDragging(true);
            }
        };

        const handleDragLeave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
        };

        const handleDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            if (disabled) return;

            const file = e.dataTransfer.files?.[0];
            if (file) {
                handleFileChange(file);
            }
        };

        return (
            <div className={cn('w-full', className)} ref={ref}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={disabled}
                    {...props}
                />

                {preview ? (
                    <div className="relative inline-block">
                        <div className="group relative h-24 w-24 overflow-hidden rounded-4xl border-2 border-gray-200 dark:border-gray-700">
                            <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white/10">
                                <button
                                    type="button"
                                    onClick={handleClick}
                                    disabled={disabled}
                                    className="cursor-pointer rounded-full bg-white p-1.5 transition-colors hover:bg-gray-100 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                                >
                                    <Upload className="h-3.5 w-3.5 text-gray-700 dark:text-gray-200" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    disabled={disabled}
                                    className="cursor-pointer rounded-full bg-white p-1.5 transition-colors hover:bg-red-50 dark:bg-neutral-900 dark:hover:bg-red-800"
                                >
                                    <X className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={handleClick}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={cn(
                            'hover:border-primary dark:hover:border-ring/50 flex h-24 w-24 cursor-pointer items-center justify-center rounded-4xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100 dark:border-input dark:bg-input/30 dark:hover:bg-input/20',
                            disabled && 'cursor-not-allowed opacity-50',
                            isDragging && 'border-primary bg-primary/10'
                        )}
                    >
                        <Upload className="h-6 w-6 text-gray-400 dark:text-gray-300" />
                    </div>
                )}

                {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>
        );
    }
);

ImageUpload.displayName = 'ImageUpload';

export { ImageUpload };