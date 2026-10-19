"use client";
import { t as translateCopy } from "@/lib/i18n";

import { useState } from "react";
import { useTrade } from "../TradeContext";
import { validateStep1 } from "../validation";
import { StrKey } from "@stellar/stellar-sdk";
import { formatCurrencyAmount, getCurrencyInfo } from "@/lib/currency";

const COMMODITIES = ["Maize", "Rice", "Sorghum", "Millet", "Cassava", "Yam", "Groundnut", "Soybean"];
const UNITS = ["kg", "tonnes", "bags (50kg)", "bags (100kg)"];

export default function Step1Details() {
  const { data, update, setStep } = useTrade();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const qty = parseFloat(data.quantity);
  const price = parseFloat(data.pricePerUnit);
  const totalValue = !isNaN(qty) && !isNaN(price) ? qty * price : NaN;

  const totalDisplay = isNaN(totalValue)
    ? "—"
    : formatCurrencyAmount(totalValue, data.currency, {
        showCode: true,
        grouping: true,
      });

  const isQtyValid = data.quantity !== "" && !isNaN(qty) && qty > 0;
  const isPriceValid = data.pricePerUnit !== "" && !isNaN(price) && price > 0;
  const isAddressValid =
    data.sellerAddress !== "" &&
    ((data.sellerAddress.trim().startsWith("G") && StrKey.isValidEd25519PublicKey(data.sellerAddress.trim())) ||
      (data.sellerAddress.trim().startsWith("C") && StrKey.isValidContract(data.sellerAddress.trim())));

  const valid =
    data.commodity !== "" && isQtyValid && isPriceValid && isAddressValid;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validateStep1(data as unknown as Record<string, unknown>);
    setErrors((prev) => ({
      ...prev,
      [field]: errs[field] || "",
    }));
  };

  const handleContinue = () => {
    const allTouched: Record<string, boolean> = {};
    for (const key of ["commodity", "quantity", "unit", "pricePerUnit", "currency", "sellerAddress"]) {
      allTouched[key] = true;
    }
    setTouched(allTouched);
    const errs = validateStep1(data as unknown as Record<string, unknown>);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setStep(2);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="commodity" className="text-sm text-text-secondary">{translateCopy("trade.commodity")}</label>
        <select
          id="commodity"
          value={data.commodity}
          onChange={(e) => { update({ commodity: e.target.value }); setErrors((prev) => ({ ...prev, commodity: "" })); }}
          onBlur={() => handleBlur("commodity")}
          className="bg-bg-input border border-border-default rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-border-focus"
        >
          <option value="">{translateCopy("ui.select_commodity_942e76a")}</option>
          {COMMODITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.commodity && touched.commodity && <p role="alert" aria-live="polite" className="text-status-danger text-xs mt-1">{errors.commodity}</p>}
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="quantity" className="text-sm text-text-secondary">{translateCopy("trade.quantity")}</label>
          <input
            id="quantity"
            type="number"
            min="0"
            placeholder={translateCopy("ui.e_g_500_bc628f9")}
            value={data.quantity}
            onChange={(e) => { update({ quantity: e.target.value }); setErrors((prev) => ({ ...prev, quantity: "" })); }}
            onBlur={() => handleBlur("quantity")}
            className="bg-bg-input border border-border-default rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-border-focus"
          />
          {errors.quantity && touched.quantity && <p role="alert" aria-live="polite" className="text-status-danger text-xs mt-1">{errors.quantity}</p>}
        </div>
        <div className="flex flex-col gap-1 w-36">
          <label htmlFor="unit" className="text-sm text-text-secondary">{translateCopy("trade.unit")}</label>
          <select
            id="unit"
            value={data.unit}
            onChange={(e) => update({ unit: e.target.value })}
            className="bg-bg-input border border-border-default rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-border-focus"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="price-per-unit" className="text-sm text-text-secondary">{translateCopy("ui.price_per_unit_ngn_bd3ba08")}</label>
          <input
            id="price-per-unit"
            type="number"
            min="0"
            placeholder={translateCopy("ui.e_g_450_812070a")}
            value={data.pricePerUnit}
            onChange={(e) => { update({ pricePerUnit: e.target.value }); setErrors((prev) => ({ ...prev, pricePerUnit: "" })); }}
            onBlur={() => handleBlur("pricePerUnit")}
            className="bg-bg-input border border-border-default rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-border-focus"
          />
          {errors.pricePerUnit && touched.pricePerUnit && <p role="alert" aria-live="polite" className="text-status-danger text-xs mt-1">{errors.pricePerUnit}</p>}
        </div>
        <div className="flex flex-col gap-1 w-28">
          <label htmlFor="currency" className="text-sm text-text-secondary">{translateCopy("trade.currency")}</label>
          <select
            id="currency"
            value={data.currency}
            onChange={(e) => update({ currency: e.target.value })}
            className="bg-bg-input border border-border-default rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-border-focus"
          >
            <option value="NGN">{getCurrencyInfo("NGN").code}</option>
            <option value="cNGN">{getCurrencyInfo("cNGN").code}</option>
          </select>
        </div>
      </div>

      {/* Total preview */}
      <div className="flex items-center justify-between rounded-lg bg-bg-elevated px-4 py-3 border border-border-default">
        <span className="text-sm text-text-secondary">{translateCopy("ui.estimated_total_1636f5a")}</span>
        <span className="text-gold font-semibold">{totalDisplay}</span>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="seller-address" className="text-sm text-text-secondary">{translateCopy("ui.seller_stellar_address_89151ee")}</label>
        <input
          id="seller-address"
          type="text"
          placeholder={translateCopy("ui.g_36b6ba2")}
          value={data.sellerAddress}
          onChange={(e) => { update({ sellerAddress: e.target.value.trim() }); setErrors((prev) => ({ ...prev, sellerAddress: "" })); }}
          onBlur={() => handleBlur("sellerAddress")}
          className="bg-bg-input border border-border-default rounded-md px-4 py-3 text-text-primary font-mono text-sm focus:outline-none focus:border-border-focus"
        />
        {errors.sellerAddress && touched.sellerAddress && <p role="alert" aria-live="polite" className="text-status-danger text-xs mt-1">{errors.sellerAddress}</p>}
      </div>

      <button
        disabled={!valid}
        onClick={handleContinue}
        className="mt-2 h-12 rounded-full bg-gradient-gold-cta text-text-inverse font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {translateCopy("ui.continue_to_negotiation_e3ae13f")}
      </button>
    </div>
  );
}
