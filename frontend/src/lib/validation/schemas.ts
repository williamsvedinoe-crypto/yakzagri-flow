import { z } from "zod";
import { StrKey } from "@stellar/stellar-sdk";

const isValidStellarAddress = (value: string): boolean => {
  const address = value.trim();
  if (!address) return false;
  if (address.startsWith("G")) return StrKey.isValidEd25519PublicKey(address);
  if (address.startsWith("C")) return StrKey.isValidContract(address);
  return false;
};

export const TradeSchema = z.object({
  tradeId: z.string().min(1, "Trade ID is required"),
  buyerAddress: z
    .string()
    .min(1, "Buyer address is required")
    .refine((value) => isValidStellarAddress(value), { message: "Invalid Stellar address" }),
  sellerAddress: z
    .string()
    .min(1, "Seller address is required")
    .refine((value) => isValidStellarAddress(value), { message: "Invalid Stellar address" }),
  amountCngn: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Amount must be a valid positive number"),
  buyerLossBps: z
    .number()
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .max(10000, "Cannot exceed 10000 bps"),
  sellerLossBps: z
    .number()
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .max(10000, "Cannot exceed 10000 bps"),
  status: z.string().min(1, "Status is required"),
  createdAt: z.string().min(1, "Created date is required"),
  updatedAt: z.string().min(1, "Updated date is required"),
});

export type Trade = z.infer<typeof TradeSchema>;

export const WalletSchema = z.object({
  balance: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Balance must be a valid non-negative number"),
  asset: z.string().min(1, "Asset code is required"),
});

export type Wallet = z.infer<typeof WalletSchema>;

export const DisputeSchema = z.object({
  tradeId: z.string().min(1, "Trade ID is required"),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason cannot exceed 500 characters"),
  category: z.enum(["quality", "delivery", "payment", "fraud", "other"], {
    message: "Invalid dispute category",
  }),
  evidenceCids: z.array(z.string().min(1)).optional(),
});

export type Dispute = z.infer<typeof DisputeSchema>;

export const ManifestSchema = z.object({
  driverName: z
    .string()
    .min(2, "Driver name must be at least 2 characters")
    .max(100, "Driver name cannot exceed 100 characters"),
  driverPhone: z
    .string()
    .regex(/^\+?[0-9\s\-().]{7,20}$/, "Invalid phone number format"),
  licensePlate: z
    .string()
    .min(2, "License plate must be at least 2 characters")
    .max(20, "License plate cannot exceed 20 characters"),
  vehicleType: z.string().max(50, "Vehicle type cannot exceed 50 characters").optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export type Manifest = z.infer<typeof ManifestSchema>;

export const NotificationPreferencesSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean(),
  tradeUpdates: z.boolean(),
  disputeAlerts: z.boolean(),
  settlementAlerts: z.boolean(),
  marketingEmails: z.boolean().default(false),
});

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

/**
 * Per-endpoint response schemas used to validate live API responses.
 * Attach these to `request()`/`requestWithResult()` so backend schema drift
 * is caught at the boundary instead of silently breaking the UI.
 */
export const TradeListSchema = z.array(TradeSchema);
export type TradeList = z.infer<typeof TradeListSchema>;

export const TradeResponseSchema = TradeSchema;
export type TradeResponse = z.infer<typeof TradeResponseSchema>;

export const WalletResponseSchema = WalletSchema;
export type WalletResponse = z.infer<typeof WalletResponseSchema>;

export const DisputeResponseSchema = DisputeSchema;
export type DisputeResponse = z.infer<typeof DisputeResponseSchema>;

export const ManifestResponseSchema = ManifestSchema;
export type ManifestResponse = z.infer<typeof ManifestResponseSchema>;

export const NotificationPreferencesResponseSchema = NotificationPreferencesSchema;
export type NotificationPreferencesResponse = z.infer<
  typeof NotificationPreferencesResponseSchema
>;

export const ApiErrorSchema = z.object({
  message: z.string().min(1, "Error message is required"),
  code: z.string().optional(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const EmptyResponseSchema = z.union([z.null(), z.undefined(), z.object({}).passthrough()]);
export type EmptyResponse = z.infer<typeof EmptyResponseSchema>;
