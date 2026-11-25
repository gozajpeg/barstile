export interface BarstileWidgetProps {
  mode?: 'invisible' | 'interactive';
  challengeUrl?: string;
  verifyUrl?: string;
  onSuccess?: (token: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: Record<string, any>;
}

export function BarstileWidget(props: BarstileWidgetProps): any;
export default BarstileWidget;
