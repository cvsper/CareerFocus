import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SignaturePadRef {
  clear: () => void;
  getSignature: () => string | null;
  isEmpty: () => boolean;
}

interface SignaturePadProps {
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ label = 'Signature', disabled = false, className = '' }, ref) => {
    const signatureRef = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        signatureRef.current?.clear();
      },
      getSignature: () => {
        if (signatureRef.current?.isEmpty()) {
          return null;
        }
        return signatureRef.current?.getTrimmedCanvas().toDataURL('image/png') || null;
      },
      isEmpty: () => {
        return signatureRef.current?.isEmpty() ?? true;
      },
    }));

    const handleClear = () => {
      signatureRef.current?.clear();
    };

    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground">
            {label}
          </label>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
            >
              <Eraser className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
        <div
          className={cn(
            'border-2 border-dashed rounded-lg bg-card transition-colors',
            disabled ? 'border-border bg-muted' : 'border-input hover:border-primary'
          )}
        >
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              className: 'w-full h-32 rounded-lg',
              style: {
                width: '100%',
                height: '128px',
              },
            }}
            penColor="black"
            backgroundColor="transparent"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {disabled
            ? 'Signature cannot be modified after submission'
            : 'Sign above using your mouse or touch screen'}
        </p>
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';
