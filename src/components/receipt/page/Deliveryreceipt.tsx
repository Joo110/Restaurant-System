export default function DeliveryReceipt() {
  const items = [
    { name: "Cheeseburger x 2", price: 24.69 },
    { name: "French Fries x 1", price: 5.06 },
    { name: "Milkshake x 1", price: 11.09 },
  ];

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const vat = subtotal * 0.1;
  const discount = -2.64;
  const deliveryFee = 2.0;
  const total = subtotal + vat + discount + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans py-10">
      <div className="bg-white w-72 rounded-2xl shadow-xl p-6 font-mono text-xs">
        {/* Header */}
        <div className="flex flex-col items-center mb-5 text-center">
          <div className="w-10 h-10 bg-gray-900 rounded-lg mb-2 flex items-center justify-center">
            <span className="text-white text-sm font-bold">R</span>
          </div>
          <p className="font-bold text-sm text-gray-900 uppercase tracking-widest">Restaurant Name</p>
          <p className="text-gray-400 text-[10px] mt-1">Downtown Branch</p>
          <p className="text-gray-400 text-[10px]">123 Main Street, Flavor City</p>
          <p className="text-gray-400 text-[10px]">Tel: 01-222-888-3310</p>
          <p className="text-gray-400 text-[10px]">Tax ID: 02-122-1929919</p>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 mb-4" />

        <div className="flex justify-between mb-1">
          <span className="text-gray-500">Order#</span>
          <span className="font-semibold">10245</span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="text-gray-500">Date</span>
          <span className="font-semibold">Oct 26, 2023</span>
        </div>

        <p className="text-gray-600 font-bold mb-2 tracking-wide">DELIVERY</p>
        <div className="text-gray-500 text-[11px] mb-4 leading-relaxed space-y-0.5">
          <p>Customer: Ahmed Ali</p>
          <p>☎ 555 123 4567</p>
          <p>📍 123 Anywhere Gallery, Al Daily Customer Bay</p>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 mb-4" />

        <div className="space-y-2 mb-4">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-gray-700 flex-1">{item.name}</span>
              <span className="font-semibold">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-dashed border-gray-300 mb-4" />

        <div className="space-y-1.5 text-[11px] mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">VAT (10%)</span>
            <span>${vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-green-600 font-medium">
            <span>Discount</span>
            <span>${discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 mb-4" />

        <div className="flex justify-between font-bold text-sm mb-4">
          <span>TOTAL</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <div className="space-y-1 text-[10px] mb-4">
          <div className="flex justify-between text-gray-500">
            <span>Payment Method</span>
            <span className="font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-700">CASH</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Amount Paid</span>
            <span>$60.00</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Change Due</span>
            <span>${(60 - total).toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 mb-4" />

        {/* Barcode-style decoration */}
        <div className="flex justify-center gap-0.5 mb-3">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-800"
              style={{ width: i % 3 === 0 ? 3 : 1, height: 28 }}
            />
          ))}
        </div>

        <p className="text-center text-[10px] text-gray-400 leading-relaxed">
          Thank you for dining with us!<br />We hope you enjoyed your meal!
        </p>
      </div>
    </div>
  );
}