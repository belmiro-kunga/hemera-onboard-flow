import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

interface FileUploadProps {
  id: string;
  label: string;
  description?: string;
  accept?: string;
  maxSize?: number; // in MB
  currentFile?: File | null;
  currentPreview?: string;
  onFileChange: (file: File | null) => void;
  className?: string;
  previewClassName?: string;
  icon?: React.ReactNode;
}

export const FileUploadComponent = ({
  id,
  label,
  description,
  accept = "image/*",
  maxSize = 2,
  currentFile,
  currentPreview,
  onFileChange,
  className = "",
  previewClassName = "max-h-20",
  icon = <Upload className="h-8 w-8 text-muted-foreground" />
}: FileUploadProps) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`);
        return;
      }
      onFileChange(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`);
        return;
      }
      onFileChange(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = () => {
    onFileChange(null);
  };

  const getPreviewUrl = () => {
    if (currentFile) {
      return URL.createObjectURL(currentFile);
    }
    return currentPreview;
  };

  const previewUrl = getPreviewUrl();

  return (
    <div className={`space-y-4 ${className}`}>
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img 
                src={previewUrl} 
                alt={`${label} preview`}
                className={`mx-auto ${previewClassName}`}
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={removeFile}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentFile?.name || 'Arquivo atual'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {icon}
            <div>
              <p className="text-sm font-medium">{label}</p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          className="flex-1" 
          onClick={() => document.getElementById(id)?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          {previewUrl ? `Alterar ${label}` : `Upload ${label}`}
        </Button>
        {previewUrl && (
          <Button variant="outline" onClick={removeFile}>
            Remover
          </Button>
        )}
      </div>
      
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};