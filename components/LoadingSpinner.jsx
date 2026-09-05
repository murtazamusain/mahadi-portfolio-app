export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="w-10 h-10 border-4 border-[#E9ECEF] border-t-[#2563EB] rounded-full animate-spin"></div>
      <p className="text-[#64748B] mt-3 text-sm">{message}</p>
    </div>
  );
}
