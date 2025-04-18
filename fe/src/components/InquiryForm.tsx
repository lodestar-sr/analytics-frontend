import {
  FormControl,
  Input,
  Button,
  useColorModeValue,
  Flex,
  Box,
  Icon,
  Spinner,
} from "@chakra-ui/react";
import { FiSend } from "react-icons/fi";

interface InquiryFormProps {
  sessionId: string | null;
  question: string;
  setQuestion: (q: string) => void;
  loading: boolean;
  submitInquiry: (q: string) => void;
}

const InquiryForm: React.FC<InquiryFormProps> = ({
  sessionId,
  question,
  setQuestion,
  loading,
  submitInquiry,
}) => {
  const inputBg = useColorModeValue("white", "gray.700");
  const containerBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const placeholderColor = useColorModeValue("gray.400", "gray.500");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const buttonBg = useColorModeValue("brand.500", "brand.700");
  const buttonHoverBg = useColorModeValue("brand.700", "brand.900");
  const buttonActiveBg = useColorModeValue("brand.600", "brand.800");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      submitInquiry(question);
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      bg={containerBg}
      borderRadius="lg"
      boxShadow="md"
      p={{ base: 3, md: 4 }}
      border="1px"
      borderColor={borderColor}
      transition="all 0.3s ease"
      _hover={{
        boxShadow: "lg",
        borderColor: useColorModeValue("brand.500", "brand.50"),
      }}
    >
      <FormControl isDisabled={!sessionId || loading}>
        <Flex align="center" gap={{ base: 2, md: 3 }}>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your business question..."
            bg={inputBg}
            color={textColor}
            borderColor={borderColor}
            borderRadius="md"
            size="lg"
            _placeholder={{ color: placeholderColor }}
            _hover={{ borderColor: useColorModeValue("brand.500", "brand.50") }}
            _focus={{
              borderColor: useColorModeValue("brand.500", "brand.50"),
              boxShadow: `0 0 0 1px ${useColorModeValue(
                "brand.500",
                "brand.50"
              )}`,
            }}
            flex="1"
            fontSize={{ base: "sm", md: "md" }}
            py={{ base: 2, md: 3 }}
            transition="all 0.2s"
          />
          <Button
            type="submit"
            variant="brand"
            isLoading={loading}
            isDisabled={loading || !question.trim()}
            size="lg"
            borderRadius="md"
            bg={buttonBg}
            color="white"
            _hover={{ bg: buttonHoverBg }}
            _active={{ bg: buttonActiveBg }}
            _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
            width={{ base: "48px", md: "120px" }}
            height={{ base: "40px", md: "48px" }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            transition="all 0.2s"
          >
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <Box display={{ base: "none", md: "block" }} mr={2}>
                  Send
                </Box>
                <Icon as={FiSend} boxSize={{ base: 5, md: 4 }} />
              </>
            )}
          </Button>
        </Flex>
      </FormControl>
    </Box>
  );
};

export default InquiryForm;
