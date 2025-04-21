import {
  Box,
  Stack,
  Text,
  Heading,
  Spinner,
  VStack,
  useColorModeValue,
  Center,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  prism,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import ChartRenderer from "./ChartRenderer";
import TableRenderer from "./TableRenderer";
import { useRef, useEffect } from "react";

interface ChartConfig {
  xAxis: { key: string; label: string };
  yAxes: { key: string; label: string; color: string }[];
}

interface Inquiry {
  id: string;
  question: string;
  status: string;
  timeFrame?: string;
  sql?: string;
  tableData?: any[];
  chartType?: string;
  chartConfig?: ChartConfig;
  textualAnswer?: string;
}

interface ResultsDisplayProps {
  inquiries: Inquiry[];
  streamedText: { [key: string]: string };
  latestInquiryId?: string;
  onExampleClick?: (question: string) => void;
}

const MotionBox = motion(Box);

// Example questions to display when there are no inquiries
const exampleQuestions = [
  "How is our sales revenue trending over time?",
  "Which customer segment generates the most revenue?",
  "What are our best selling products?",
];

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  inquiries,
  streamedText,
  latestInquiryId,
  onExampleClick,
}) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.300");
  const codeBg = useColorModeValue("gray.100", "gray.800");
  const streamedBg = useColorModeValue("gray.50", "gray.600");
  const syntaxTheme = useColorModeValue(prism, vscDarkPlus);
  const exampleBg = useColorModeValue("gray.100", "gray.600");
  const exampleHoverBg = useColorModeValue("gray.200", "gray.500");
  const hoverBorderColor = useColorModeValue("brand.500", "brand.50");

  const inquiryRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (inquiries.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [inquiries]);

  useEffect(() => {
    if (latestInquiryId && inquiryRefs.current[latestInquiryId]) {
      inquiryRefs.current[latestInquiryId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [latestInquiryId]);

  const handleExampleClick = (question: string) => {
    if (onExampleClick) {
      onExampleClick(question);
    }
  };

  // Display example questions when no inquiries exist
  if (inquiries.length === 0) {
    return (
      <VStack spacing={6} align="stretch" h="100%">
        <Center flexDirection="column" py={12} h="100%">
          <Heading color={secondaryTextColor} fontSize={{ md: "xl" }} mb={4}>
            Ask a business question to get started?
          </Heading>
          <Text color={secondaryTextColor} fontSize="sm" mb={4}>
            Examples:
          </Text>
          <VStack spacing={3} w="100%" maxW="100%">
            {exampleQuestions.map((question, index) => (
              <Box
                key={index}
                as="button"
                onClick={() => handleExampleClick(question)}
                bg={exampleBg}
                p={3}
                borderRadius="md"
                w="100%"
                textAlign="left"
                _hover={{ bg: exampleHoverBg }}
                transition="all 0.2s"
              >
                <Text color={textColor}>{question}</Text>
              </Box>
            ))}
          </VStack>
        </Center>
      </VStack>
    );
  }

  // Display results when there are inquiries
  return (
    <Box
      width="100%"
      height="100%"
      maxWidth="100%"
      position="relative"
      overflowY="auto"
      ref={scrollContainerRef}
      maxHeight={{ base: "auto", md: "calc(100vh - 250px)" }}
    >
      <VStack spacing={6} align="stretch" width="100%">
        <Stack spacing={6}>
          {inquiries.map((inquiry) => (
            <MotionBox
              key={inquiry.id}
              ref={(el) => {
                if (el instanceof HTMLDivElement || el === null) {
                  inquiryRefs.current[inquiry.id] = el;
                }
              }}
            >
              <Box
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                p={{ base: 4, md: 6 }}
                boxShadow="md"
                transition="all 0.2s"
                _hover={{
                  borderColor: hoverBorderColor,
                }}
              >
                <Heading size="sm" color={textColor} mb={3}>
                  {inquiry.question}
                </Heading>
                <Box fontSize="sm" color={secondaryTextColor} mb={2}>
                  <strong>Status:</strong>{" "}
                  {inquiry.status === "done" ? "Completed" : "Processing"}
                  {inquiry.status !== "done" && (
                    <Spinner size="xs" ml={2} color="brand.500" />
                  )}
                </Box>
                {inquiry.timeFrame && (
                  <Text fontSize="sm" color={secondaryTextColor} mb={2}>
                    <strong>Time Frame:</strong> {inquiry.timeFrame}
                  </Text>
                )}

                {inquiry.sql && (
                  <Box my={4}>
                    <Text fontWeight="medium" color={textColor} mb={2}>
                      Generated SQL:
                    </Text>
                    <SyntaxHighlighter
                      language="sql"
                      style={syntaxTheme}
                      customStyle={{
                        background: codeBg,
                        borderRadius: "0.375rem",
                        padding: "0.75rem",
                        fontSize: "0.875rem",
                      }}
                      wrapLines={true}
                      wrapLongLines={true}
                    >
                      {inquiry.sql}
                    </SyntaxHighlighter>
                  </Box>
                )}

                {inquiry.tableData && (
                  <Box my={4}>
                    <Text fontWeight="medium" color={textColor} mb={2}>
                      Data Table:
                    </Text>
                    <Box overflowX="auto">
                      <TableRenderer tableData={inquiry.tableData} />
                    </Box>
                  </Box>
                )}

                {inquiry.chartType && inquiry.tableData && (
                  <Box my={4}>
                    <Text fontWeight="medium" color={textColor} mb={2}>
                      Chart:
                    </Text>
                    <Box maxW="100%" overflow="hidden">
                      <ChartRenderer
                        tableData={inquiry.tableData}
                        chartType={inquiry.chartType}
                        chartConfig={inquiry.chartConfig}
                      />
                    </Box>
                  </Box>
                )}

                {inquiry.textualAnswer && (
                  <Box my={4}>
                    <Text fontWeight="medium" color={textColor} mb={2}>
                      Textual Analysis:
                    </Text>
                    <MotionBox
                      bg={streamedBg}
                      p={4}
                      borderRadius="md"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box color={textColor}>
                        {streamedText[inquiry.id] !== undefined ? (
                          streamedText[inquiry.id]
                        ) : (
                          <Spinner size="sm" color="brand.500" />
                        )}
                      </Box>
                    </MotionBox>
                  </Box>
                )}
              </Box>
            </MotionBox>
          ))}
          <div ref={bottomRef} />
        </Stack>
      </VStack>
    </Box>
  );
};

export default ResultsDisplay;
