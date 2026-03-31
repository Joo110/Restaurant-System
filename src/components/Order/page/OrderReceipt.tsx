// src/components/Order/components/OrderReceipt.tsx
import { useRef } from "react";
import type { OrderItem } from "../page/CreateOrder";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReceiptData = {
  orderNumber: string;
  createdAt: Date;
  orderType: "dine-in" | "takeaway" | "delivery";
  tableNumber?: string;
  // branch info
  branchName?: string;
  branchAddress?: string;
  taxId?: string;
  // items
  items: OrderItem[];
  // totals
  subtotal: number;
  taxRate: number; // e.g. 0.2 => 20%
  tax: number;
  promoDiscount: number;
  deliveryFee: number;
  total: number;
  // payment
  paymentMethod: string;
  // card payment
  cardLast4?: string;
  authCode?: string;
  transId?: string;
  // cash payment
  amountPaid?: number;
  changeDue?: number;
  // delivery customer info
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  data: ReceiptData;
  onClose: () => void;
  onPrintDone: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(d: Date) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatTime(d: Date) {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DashedLine() {
  return (
    <div
      style={{
        borderTop: "1.5px dashed #c8c8c8",
        margin: "10px 0",
      }}
    />
  );
}

function TwoCol({
  left,
  right,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "8px",
        fontSize: "12px",
      }}
    >
      <div>{left}</div>
      {right !== undefined && <div style={{ textAlign: "right" }}>{right}</div>}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold,
  large,
  color,
}: {
  label: string;
  value: string;
  bold?: boolean;
  large?: boolean;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: large ? "15px" : "12px",
        fontWeight: bold ? "800" : "400",
        color: color ?? (bold ? "#111" : "#555"),
        marginBottom: "5px",
      }}
    >
      <span>{label}</span>
      <span style={{ color: color ?? (bold ? "#111" : "#555") }}>{value}</span>
    </div>
  );
}

// ─── Receipt Body ─────────────────────────────────────────────────────────────

function ReceiptBody({ data }: { data: ReceiptData }) {
  const isDelivery = data.orderType === "delivery";
  const taxPct = Math.round((data.taxRate ?? 0.2) * 100);

  return (
    <div
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        background: "#fff",
        color: "#111",
        padding: "20px 18px",
        maxWidth: "320px",
        margin: "0 auto",
      }}
    >
      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: "14px" }}>
        {/* Logo placeholder */}
        <div
          style={{
            width: "52px",
            height: "52px",
            background: "#111",
            borderRadius: "12px",
            margin: "0 auto 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "10px",
            letterSpacing: "0.5px",
          }}
        >
          logo
        </div>
        <div
          style={{
            fontWeight: "900",
            fontSize: "20px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}
        >
          Restaurant Name
        </div>
        <div style={{ fontSize: "12px", marginTop: "3px", fontWeight: "600" }}>
          {data.branchName ?? "DOWNTOWN BRANCH"}
        </div>
        <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>
          {data.branchAddress ?? "123 Flavor Street, Foodie City"}
        </div>
        <div style={{ fontSize: "11px", color: "#555" }}>
          Tax ID: {data.taxId ?? "12-3456789"}
        </div>
      </div>

      <DashedLine />

      {/* ── Order Info ── */}
      <TwoCol
        left={
          <>
            <div style={{ fontSize: "10px", color: "#888", marginBottom: "2px" }}>ORDER #</div>
            <div style={{ fontWeight: "800", fontSize: "14px" }}>{data.orderNumber}</div>
          </>
        }
        right={
          <>
            <div style={{ fontSize: "10px", color: "#888", marginBottom: "2px" }}>DATE</div>
            <div style={{ fontWeight: "600", fontSize: "12px" }}>{formatDate(data.createdAt)}</div>
            <div style={{ fontSize: "11px", color: "#555" }}>{formatTime(data.createdAt)}</div>
          </>
        }
      />

      <DashedLine />

      {/* ── Type / Table / Customer ── */}
      {isDelivery ? (
        <>
          <div style={{ fontSize: "10px", color: "#888", marginBottom: "2px" }}>TYPE</div>
          <div style={{ fontWeight: "800", fontSize: "13px", marginBottom: "10px" }}>DELIVERY</div>

          {/* Customer Box */}
          {(data.customerName || data.customerPhone || data.customerAddress) && (
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px 12px",
                marginBottom: "10px",
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  color: "#888",
                  fontWeight: "700",
                  marginBottom: "6px",
                  letterSpacing: "0.5px",
                }}
              >
                CUSTOMER
              </div>
              {data.customerName && (
                <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                  <span>👤</span>
                  <span style={{ fontWeight: "600" }}>{data.customerName}</span>
                </div>
              )}
              {data.customerPhone && (
                <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                  <span>📞</span>
                  <span>{data.customerPhone}</span>
                </div>
              )}
              {data.customerAddress && (
                <div style={{ display: "flex", gap: "6px" }}>
                  <span>📍</span>
                  <span style={{ color: "#444" }}>{data.customerAddress}</span>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <TwoCol
          left={
            <>
              <div style={{ fontSize: "10px", color: "#888", marginBottom: "2px" }}>TYPE</div>
              <div style={{ fontWeight: "700", fontSize: "13px" }}>
                {data.orderType === "dine-in" ? "Dine-in" : "Takeaway"}
              </div>
            </>
          }
          right={
            data.tableNumber
              ? (
                <>
                  <div style={{ fontSize: "10px", color: "#888", marginBottom: "2px" }}>TABLE</div>
                  <div style={{ fontWeight: "900", fontSize: "22px" }}>{data.tableNumber}</div>
                </>
              )
              : undefined
          }
        />
      )}

      <DashedLine />

      {/* ── Items Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "10px",
          color: "#888",
          marginBottom: "8px",
          fontWeight: "700",
          letterSpacing: "0.5px",
        }}
      >
        <span>ITEM</span>
        <span>TOTAL</span>
      </div>

      {/* ── Items List ── */}
      {data.items.map((item) => (
        <div key={item.id} style={{ marginBottom: "8px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "700",
              fontSize: "13px",
            }}
          >
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
          {item.note && (
            <div
              style={{
                fontSize: "11px",
                color: "#555",
                paddingLeft: "10px",
                marginTop: "2px",
              }}
            >
              – {item.note}
            </div>
          )}
        </div>
      ))}

      <DashedLine />

      {/* ── Totals ── */}
      <SummaryRow label="Subtotal" value={`$${data.subtotal.toFixed(2)}`} />
      <SummaryRow label={`VAT (${taxPct}%)`} value={`$${data.tax.toFixed(2)}`} />
      {data.promoDiscount > 0 && (
        <SummaryRow
          label="Discount"
          value={`-$${data.promoDiscount.toFixed(2)}`}
          color="#c00"
        />
      )}
      {isDelivery && data.deliveryFee > 0 && (
        <SummaryRow label="Delivery Fee" value={`$${data.deliveryFee.toFixed(2)}`} />
      )}

      <DashedLine />

      {/* ── Grand Total ── */}
      <SummaryRow
        label="TOTAL"
        value={`$${data.total.toFixed(2)}`}
        bold
        large
      />

      <DashedLine />

      {/* ── Payment ── */}
      {isDelivery ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              marginBottom: "5px",
            }}
          >
            <span style={{ color: "#555" }}>Payment Method:</span>
            <span
              style={{
                fontWeight: "800",
                border: "1.5px solid #111",
                padding: "1px 8px",
                fontSize: "11px",
                letterSpacing: "0.5px",
              }}
            >
              {data.paymentMethod.toUpperCase()}
            </span>
          </div>
          {data.amountPaid !== undefined && (
            <SummaryRow
              label="Amount Paid:"
              value={`$${data.amountPaid.toFixed(2)}`}
            />
          )}
          {data.changeDue !== undefined && (
            <SummaryRow
              label="Change Due:"
              value={`$${data.changeDue.toFixed(2)}`}
            />
          )}
        </>
      ) : (
        <>
          <SummaryRow
            label="Payment Method:"
            value={
              data.cardLast4
                ? `VISA **** ${data.cardLast4}`
                : data.paymentMethod.toUpperCase()
            }
          />
          {data.authCode && (
            <SummaryRow label="Auth Code:" value={data.authCode} />
          )}
          {data.transId && (
            <SummaryRow label="Trans ID:" value={data.transId} />
          )}
        </>
      )}

      <DashedLine />

      {/* ── Footer ── */}
      <div
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#666",
          fontStyle: "italic",
          marginTop: "8px",
          lineHeight: "1.5",
        }}
      >
        "Thank you for dining with us! We hope you enjoyed your meal"
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function OrderReceipt({ data, onClose, onPrintDone }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = receiptRef.current?.innerHTML;
    if (!content) return;

    const printWindow = window.open(
      "",
      "_blank",
      "width=420,height=750,scrollbars=yes"
    );
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Receipt #${data.orderNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', Courier, monospace;
              background: #fff;
              color: #111;
            }
            @media print {
              @page { margin: 0; size: 80mm auto; }
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    // Small delay so content renders before print dialog
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      onPrintDone();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full sm:max-w-sm mx-0 sm:mx-4 bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* ── Action Bar ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-base">🧾</span>
            <span className="text-sm font-bold text-slate-800">
              Order Receipt
            </span>
            <span className="text-xs font-mono text-slate-400">
              #{data.orderNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-700 active:scale-95 transition-all"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-200 text-slate-500 hover:bg-slate-300 text-sm font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Scrollable Receipt Preview ── */}
        <div className="overflow-y-auto max-h-[75vh] bg-slate-100 p-3">
          <div
            ref={receiptRef}
            className="shadow-md"
            style={{ background: "#fff" }}
          >
            <ReceiptBody data={data} />
          </div>
        </div>

        {/* ── Bottom hint ── */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Click <strong>Print</strong> to open the print dialog, or{" "}
            <button
              onClick={onClose}
              className="text-blue-500 hover:underline font-semibold"
            >
              close
            </button>{" "}
            to continue without printing.
          </p>
        </div>
      </div>
    </div>
  );
}