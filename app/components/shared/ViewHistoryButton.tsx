'use client';

import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import Link from 'next/link';

interface ViewHistoryButtonProps {
  projectId: string;
  hasVersions: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
  showLabel?: boolean;
}

export function ViewHistoryButton({
  projectId,
  hasVersions,
  variant = 'outline',
  size = 'default',
  showLabel = true,
}: ViewHistoryButtonProps) {
  if (!hasVersions) return null;

  return (
    <Link href={`/projects/${projectId}/history`}>
      <Button variant={variant} size={size} title="View History">
        <History className={size === 'icon' ? 'h-4 w-4' : 'h-4 w-4 mr-2'} />
        {showLabel && size !== 'icon' && 'View History'}
      </Button>
    </Link>
  );
}
