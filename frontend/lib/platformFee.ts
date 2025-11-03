
export function getPlatformFee(): number {
  const fee = process.env.NEXT_PUBLIC_PLATFORM_FEE;
  return fee ? parseFloat(fee) : 0;
}
