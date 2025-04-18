import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: "#e0f2fe",
      100: "#bae7ff",
      500: "#0284c7",
      700: "#015f92",
      900: "#013a5e",
    },
    gray: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e5e7eb",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2a44",
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === "light" ? "#fff" : "gray.800",
        color: props.colorMode === "light" ? "gray.800" : "gray.100",
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "medium",
        borderRadius: "md",
      },
      variants: {
        brand: (props: any) => ({
          bg: props.colorMode === "light" ? "brand.500" : "brand.700",
          color: "white",
          _hover: {
            bg: props.colorMode === "light" ? "brand.700" : "brand.900",
          },
        }),
      },
    },
    Input: {
      baseStyle: (props: any) => ({
        field: {
          borderRadius: "md",
          _placeholder: {
            color: props.colorMode === "light" ? "gray.400" : "gray.500",
          },
        },
      }),
    },
    Alert: {
      variants: {
        subtle: (props: any) => ({
          container: {
            bg: props.colorMode === "light" ? "red.50" : "red.900",
            color: props.colorMode === "light" ? "red.800" : "red.200",
          },
        }),
      },
    },
  },
});

export default theme;
