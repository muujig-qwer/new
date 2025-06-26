import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { data: session } = useSession();
  const user = session?.user;

  const [wishlist, setWishlist] = useState([]);

  // API base URL-г .env-с авна
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    console.log("WishlistContext user:", user);
    if (user?._id) {
      axios
        .get(`${apiUrl}/api/auth/${user._id}/wishlist`)
        .then((res) => {
          console.log("wishlist from backend:", res.data);
          setWishlist(res.data);
        })
        .catch(() => setWishlist([]));
    }
  }, [user, apiUrl]);

  const addToWishlist = async (product) => {
    if (!user?._id) return;
    await axios.post(`${apiUrl}/api/auth/${user._id}/wishlist`, { productId: product._id });
    const res = await axios.get(`${apiUrl}/api/auth/${user._id}/wishlist`);
    setWishlist(res.data);
  };

  const removeFromWishlist = async (productId) => {
    if (!user?._id) return;
    await axios.delete(`${apiUrl}/api/auth/${user._id}/wishlist/${productId}`);
    const res = await axios.get(`${apiUrl}/api/auth/${user._id}/wishlist`);
    setWishlist(res.data);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);