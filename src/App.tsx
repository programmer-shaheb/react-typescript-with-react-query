import { useState } from "react";
import { useQuery } from "react-query";
// Components
import Drawer from "@material-ui/core/Drawer";
import LinearProgress from "@material-ui/core/LinearProgress";
import Grid from "@material-ui/core/Grid";
import AddShoppingCartIcon from "@material-ui/icons/AddShoppingCart";
import Badge from "@material-ui/core/Badge";
import { StyledButton, Wrapper } from "./App.styles";
import Item from "./Item/Item";
import Cart from "./Cart/Cart";

export type CartItemType = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  amount: number;
};

const getProducts = async (): Promise<CartItemType[]> =>
  await (await fetch("https://fakestoreapi.com/products")).json();

const App = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);

  const { data, isLoading, error } = useQuery<CartItemType[]>(
    "products",
    getProducts
  );

  const getTotalItems = (items: CartItemType[]) =>
    items.reduce((prev: number, curr) => prev + curr.amount, 0);

  const handleAddToCart = (clickedItem: CartItemType) => {
    //  Solution One
    // const existingCartItemIndex = cartItems.findIndex(
    //   (item) => item.id === clickedItem.id
    // );
    // const existingCartItem = cartItems[existingCartItemIndex];
    // let updatedItems: CartItemType[];
    // if (existingCartItem) {
    //   const updatedItem = {
    //     ...existingCartItem,
    //     amount: existingCartItem.amount + 1,
    //   };
    //   updatedItems = [...cartItems];
    //   updatedItems[existingCartItemIndex] = updatedItem;
    // } else {
    //   const modifyItem = { ...clickedItem, amount: 1 };
    //   updatedItems = [...cartItems, modifyItem];
    // }
    // setCartItems(updatedItems);
    // Solution Two

    setCartItems((prev) => {
      const isItemInCart = prev.find((item) => item.id === clickedItem.id);

      if (isItemInCart) {
        return prev.map((item) =>
          item.id === isItemInCart.id
            ? { ...item, amount: item.amount + 1 }
            : item
        );
      }

      return [...prev, { ...clickedItem, amount: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    const isExistingItemIndex = cartItems.findIndex((item) => item.id === id);
    const isExistingItem = cartItems[isExistingItemIndex];

    let newFilteredCart: CartItemType[];
    if (isExistingItem.amount > 1) {
      const newCart = {
        ...isExistingItem,
        amount: isExistingItem.amount - 1,
      };
      newFilteredCart = [...cartItems];
      newFilteredCart[isExistingItemIndex] = newCart;
    } else {
      newFilteredCart = cartItems.filter((item) => item.id !== id);
    }

    setCartItems(newFilteredCart);
  };

  if (isLoading) return <LinearProgress />;
  if (error) return <div>Something went wrong...</div>;

  return (
    <Wrapper>
      <Drawer
        anchor={"right"}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      >
        <Cart
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          addToCart={handleAddToCart}
        />
      </Drawer>
      <StyledButton onClick={() => setCartOpen(true)}>
        <Badge color="error" badgeContent={getTotalItems(cartItems)}>
          <AddShoppingCartIcon />
        </Badge>
      </StyledButton>
      <Grid container spacing={3}>
        {data?.map((item) => (
          <Grid item key={item.id} xs={12} sm={4}>
            <Item item={item} handleAddToCart={handleAddToCart} />
          </Grid>
        ))}
      </Grid>
    </Wrapper>
  );
};

export default App;
