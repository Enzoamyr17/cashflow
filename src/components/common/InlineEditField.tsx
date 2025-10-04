'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface InlineEditFieldProps {
  value: string;
  onSave: (value: string) => void;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
  className?: string;
}

export function InlineEditField({
  value,
  onSave,
  type = 'text',
  placeholder,
  className,
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
    >
      {value || <span className="text-gray-400">{placeholder}</span>}
    </div>
  );
}
