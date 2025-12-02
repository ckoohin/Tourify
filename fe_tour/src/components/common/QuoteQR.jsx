import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download } from 'lucide-react';

const QuoteQR = ({ value, size = 200, fileName = 'qrcode' }) => {
  const qrRef = useRef();

  // Hàm xử lý tải ảnh QR về máy
  const downloadQR = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${fileName}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Khu vực hiển thị QR */}
      <div className="p-3 bg-white border-2 border-dashed border-indigo-200 rounded-xl" ref={qrRef}>
        <QRCodeCanvas
          value={value}
          size={size}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"H"} // Mức độ sửa lỗi cao nhất (cho phép chèn logo nếu muốn)
          includeMargin={true}
        />
      </div>

      {/* Nút tải xuống */}
      <button
        type="button"
        onClick={downloadQR}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
      >
        <Download size={16} />
        Tải mã QR
      </button>
    </div>
  );
};

export default QuoteQR;