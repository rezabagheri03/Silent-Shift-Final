export function EmptyState({ message }: { message: string }) {
  return (
    <div className="w-full py-16 text-center">
      <p className="text-d-body-md text-text-tertiary">{message}</p>
    </div>
  );
}

export function LoadingBlock() {
  return (
    <div className="w-full py-10 text-center">
      <span className="inline-block w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="text-d-body-sm text-red-400 text-right py-2">{message}</p>
  );
}
