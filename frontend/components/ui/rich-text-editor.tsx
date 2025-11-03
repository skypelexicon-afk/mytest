'use client';

import * as React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Bold,
    Italic,
    Underline,
    Link as LinkIcon,
    List,
    ListOrdered,
    Heading1,
    Heading2,
} from 'lucide-react';

export function RichTextEditor({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    const textRef = React.useRef<HTMLTextAreaElement>(null);

    const wrapSelection = (tag: string, attrs?: string) => {
        const textarea = textRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = value.substring(start, end);
        const before = value.substring(0, start);
        const after = value.substring(end);

        const openTag = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;
        const closeTag = `</${tag}>`;

        onChange(before + openTag + selected + closeTag + after);
    };

    const insertList = (ordered: boolean) => {
        const textarea = textRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = value.substring(start, end);
        const before = value.substring(0, start);
        const after = value.substring(end);

        const lines = selected.split('\n');
        const listItems = lines
            .map((line) => `<li>${line || '&nbsp;'}</li>`)
            .join('');

        const tag = ordered ? 'ol' : 'ul';
        onChange(before + `<${tag}>${listItems}</${tag}>` + after);
    };

    const addLink = () => {
        const textarea = textRef.current;
        if (!textarea) return;
        const url = prompt('Enter URL:');
        if (!url) return;
        wrapSelection('a', `href="${url}" target="_blank"`);
    };

    return (
        <div className="space-y-2">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border rounded-md p-2 bg-muted">
                <Toggle size="sm" onClick={() => wrapSelection('b')}>
                    <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" onClick={() => wrapSelection('i')}>
                    <Italic className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" onClick={() => wrapSelection('u')}>
                    <Underline className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="mx-1" />

                <Toggle size="sm" onClick={() => wrapSelection('h1')}>
                    <Heading1 className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" onClick={() => wrapSelection('h2')}>
                    <Heading2 className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="mx-1" />

                <Toggle size="sm" onClick={() => insertList(false)}>
                    <List className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" onClick={() => insertList(true)}>
                    <ListOrdered className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="mx-1" />

                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={addLink}
                    className="flex items-center gap-1"
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>
            </div>

            {/* Textarea */}
            <textarea
                ref={textRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-48 border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Write your formatted announcement..."
            />
        </div>
    );
}
