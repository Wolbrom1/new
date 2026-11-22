'use client';

import type { ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';
import { LottieState } from './fifthseason/states';

// The brand's one-shot outcome animations: they play once as the toast
// arrives and hold their final frame.
const iconsByType: Record<'success' | 'error', ReactNode> = {
  success: <LottieState name="success" loop={false} size={22} />,
  error: <LottieState name="error" loop={false} size={22} />,
};

export function toast(props: Omit<ToastProps, 'id'>) {
  return sonnerToast.custom((id) => (
    <Toast id={id} type={props.type} description={props.description} />
  ));
}

function Toast(props: ToastProps) {
  const { id, type, description } = props;

  return (
    <div className="flex w-full toast-mobile:w-[356px] justify-center">
      <div
        data-testid="toast"
        key={id}
        className="bg-zinc-100 p-3 rounded-lg w-full toast-mobile:w-fit flex flex-row gap-2 items-center"
      >
        <div data-type={type} className="shrink-0">
          {iconsByType[type]}
        </div>
        <div className="text-zinc-950 text-sm">{description}</div>
      </div>
    </div>
  );
}

interface ToastProps {
  id: string | number;
  type: 'success' | 'error';
  description: string;
}
