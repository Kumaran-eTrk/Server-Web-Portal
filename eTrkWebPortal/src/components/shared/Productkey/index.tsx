import React, { useEffect, useState } from "react";
import { useRangeContext } from "../../contexts/range-context";
import api from "../../interceptors";
import { toast } from "react-toastify";
import { CopyIcon } from "../icons";

const ProductKey = () => {
  const [productInfo, setProductInfo] = useState({
    id: "",
    productkey: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { productkey, setProductKey }: any = useRangeContext();

  const fetchProductInfo = async () => {
    try {
      const response = await api.get(`/productinfo`);
      const data = response.data.response;
      if (data && data.productkey) {
        setProductInfo({
          id: data.id,
          productkey: data.productkey,
          description: data.description,
        });
      } else {
        setProductInfo({ id: "", productkey: "", description: "" });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const generateProductKey = async () => {
    try {
      const response = await api.post(`/productinfo`);
      toast.success("Product key created successfully");
      fetchProductInfo();
    } catch (err) {
      toast.error("Error generating product key", { autoClose: 2000 });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(productInfo.productkey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClose = () => {
    setProductKey(!productkey);
  };

  useEffect(() => {
    fetchProductInfo();
  }, [productkey.length > 0]);

  return (
    <div
      className={`bg-white rounded-sm shadow-md p-4 ${
        productInfo.productkey ? "w-auto" : "w-96"
      } flex flex-col gap-3`}
    >
      <h2 className="text-center text-xl font-semibold">Product Key</h2>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : productInfo.productkey ? (
        <>
          <div className="flex items-center gap-2 w-auto border mt-2 p-2">
            <h3>{productInfo.productkey}</h3>
            <button className="relative" onClick={handleCopy}>
              <span>
                <CopyIcon />
              </span>
              {copied && (
                <span className="absolute top-[-30px] left-[-10px] bg-gray-700 text-white text-xs rounded px-2 py-1">
                  Copied
                </span>
              )}
            </button>
          </div>
          <div></div>
        </>
      ) : (
        <div className="flex items-center justify-center">
          <button
            className="bg-[#26C0BB] px-2 py-1 rounded-md text-white text-sm"
            onClick={generateProductKey}
          >
            Generate the Key
          </button>
        </div>
      )}
      <div className="flex items-end justify-end mt-2">
        <button
          className="bg-[#26C0BB] px-2 py-1 rounded-md text-white text-sm"
          onClick={handleClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProductKey;
