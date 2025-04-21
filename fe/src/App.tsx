import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import {
  ChakraProvider,
  Box,
  Heading,
  Container,
  Flex,
  IconButton,
  useColorMode,
  useColorModeValue,
  Alert,
  AlertIcon,
  Button,
  Spinner,
  Tooltip,
  useBreakpointValue,
} from "@chakra-ui/react";
import { keyframes } from "@chakra-ui/system";
import { FiSun, FiMoon } from "react-icons/fi";
import { ErrorBoundary } from "react-error-boundary";
import InquiryForm from "./components/InquiryForm";
import ResultsDisplay from "./components/ResultsDisplay";
import theme from "./utils/theme";
import EventLog from "./components/EventLog";
import { createSession, streamInquiry, submitInquiryApi } from "./api/service";
import { FaTerminal } from "react-icons/fa";

interface ChartConfig {
  xAxis: { key: string; label: string };
  yAxes: { key: string; label: string; color: string }[];
}

interface Inquiry {
  id: string;
  sessionId: string;
  question: string;
  status: string;
  created: string;
  updated: string;
  timeFrame?: string;
  sql?: string;
  tableData?: any[];
  chartType?: string;
  chartConfig?: ChartConfig;
  textualAnswer?: string;
}

interface EventLogType {
  id: string;
  timestamp: string;
  message: string;
}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const socket = io(import.meta.env.VITE_API_BASE_URL);

const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  return (
    <Box role="alert" p={4} bg="red.50" borderRadius="md">
      <Heading size="md" color="red.800">
        Something went wrong:
      </Heading>
      <p color="red.800">{error.message}</p>
      <Button mt={4} onClick={resetErrorBoundary} colorScheme="red">
        Try again
      </Button>
    </Box>
  );
};

const App: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("#fff", "gray.800");
  const buttonBg = useColorModeValue("gray.200", "gray.700");
  const showTooltip = useBreakpointValue({ base: false, md: true });
  const headingColor = useColorModeValue("brand.500", "brand.50");
  const resultsHeadingColor = useColorModeValue("brand.500", "brand.50");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [eventLogs, setEventLogs] = useState<EventLogType[]>([]);
  const [streamedText, setStreamedText] = useState<{ [key: string]: string }>({});
  const streamedTextRef = useRef(streamedText);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);
  const [latestInquiryId, setLatestInquiryId] = useState<string | undefined>(
    undefined
  );

  const [isLogOpen, setIsLogOpen] = useState(false);

  useEffect(() => {
    const initializeSession = async (attempt = 1, maxAttempts = 3) => {
      if (attempt > maxAttempts) {
        setSessionError("Max retry attempts reached. Please refresh.");
        setIsSessionLoading(false);
        addEventLog("Max retry attempts reached for session creation");
        return;
      }

      setIsSessionLoading(true);
      try {
        const newSessionId = await createSession();
        setSessionId(newSessionId);
        setSessionError(null);
        localStorage.setItem("sessionId", newSessionId);
        addEventLog(`Session created: ${newSessionId}`);
      } catch (error) {
        console.error(`Session creation attempt ${attempt} failed:`, error);
        setTimeout(
          () => initializeSession(attempt + 1, maxAttempts),
          1000 * 2 ** attempt
        );
      } finally {
        setIsSessionLoading(false);
      }
    };

    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
      setIsSessionLoading(false);
      setSessionError(null);
    } else {
      initializeSession();
    }

    socket.on("inquiry_updated", (inquiry: Inquiry) => {
      setInquiries((prev) => {
        const updatedInquiries = prev.some((i) => i.id === inquiry.id)
          ? prev.map((i) => (i.id === inquiry.id ? inquiry : i))
          : [...prev, inquiry];

        addEventLog(`Inquiry updated: ${inquiry.id} - ${inquiry.status}`);
        return updatedInquiries;
      });

      if (inquiry.status === "done" && !streamedTextRef.current[inquiry.id]) {
        startStreaming(inquiry.id);
      }
    });

    return () => {
      socket.off("inquiry_updated");
    };
  }, []);

  useEffect(() => {
    streamedTextRef.current = streamedText;
  }, [streamedText]);

  const addEventLog = (message: string) => {
    setEventLogs((prev) => [
      ...prev,
      { id: uuidv4(), timestamp: new Date().toISOString(), message },
    ]);
  };

  const handleExampleClick = (selectedQuestion: string) => {
    setQuestion(selectedQuestion);
    const inputElement = document.querySelector(
      'input[placeholder="Ask your business question..."]'
    );
    if (inputElement instanceof HTMLInputElement) {
      inputElement.focus();
    }
    addEventLog(`Example question selected: ${selectedQuestion}`);
  };

  const submitInquiry = async (newQuestion: string) => {
    if (!sessionId || !newQuestion.trim()) {
      addEventLog("Cannot submit inquiry: No session or empty question");
      return;
    }

    setLoading(true);
    try {
      const inquiryId = await submitInquiryApi(sessionId, newQuestion);
      addEventLog(`Inquiry submitted: ${inquiryId}`);
      setQuestion("");
      setLatestInquiryId(inquiryId);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      addEventLog("Error submitting inquiry");
    } finally {
      setLoading(false);
    }
  };

  const startStreaming = async (inquiryId: string) => {
    try {
      let accumulatedText = "";
      await streamInquiry(inquiryId, (chunk) => {
        accumulatedText += chunk;
        setStreamedText((prev) => ({
          ...prev,
          [inquiryId]: accumulatedText,
        }));
      });
      addEventLog(`Streaming completed for inquiry: ${inquiryId}`);
    } catch (error) {
      console.error("Streaming error:", error);
      addEventLog(`Streaming error for inquiry ${inquiryId}: ${error}`);
    }
  };

  const retrySession = async () => {
    setSessionError(null);
    setIsSessionLoading(true);
    try {
      const newSessionId = await createSession();
      setSessionId(newSessionId);
      localStorage.setItem("sessionId", newSessionId);
      addEventLog(`Session created: ${newSessionId}`);
    } catch (error) {
      console.error("Retry failed:", error);
      setSessionError("Failed to initialize session. Please try again.");
      addEventLog("Error creating session");
    } finally {
      setIsSessionLoading(false);
    }
  };

  const clearResults = () => {
    setInquiries([]);
    setStreamedText({});
    setLatestInquiryId(undefined);
    setEventLogs([]);
  };

  const handleToggleLogs = () => {
    setIsLogOpen((prev) => !prev);
  };

  return (
    <ChakraProvider theme={theme} key={colorMode}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.reload()}
      >
        <Box minH="100vh" w="100vw" bg={bgColor} overflowX="hidden">
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bg={bgColor}
            zIndex="sticky"
            boxShadow="sm"
            py={4}
          >
            <Container maxW={{ base: "100%", md: "6xl" }}>
              <Flex justify="space-between" align="center">
                <Heading
                  onClick={clearResults}
                  size={{ base: "md", md: "lg", lg: "xl" }}
                  color={headingColor}
                  cursor="pointer"
                >
                  Business Analytics Dashboard
                </Heading>
                <Flex>
                  <Flex
                    justifyContent="center"
                    alignItems="center"
                    height={eventLogs.length === 0 ? "50px" : "auto"}
                    my={0}
                  >
                    <IconButton
                      mr={6}
                      aria-label="Toggle theme"
                      icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
                      onClick={toggleColorMode}
                      colorScheme="brand"
                      variant="outline"
                      size="lg"
                      borderRadius="full"
                      _hover={{
                        animation: `${spin} 0.5s ease`,
                        border: "none",
                      }}
                      transition="all 0.2s"
                    />
                    {showTooltip ? (
                      <Tooltip
                        label={`Show Logs${
                          eventLogs.length > 0 ? ` (${eventLogs.length})` : ""
                        }`}
                        hasArrow
                        placement="top"
                        openDelay={300}
                        bg="gray.700"
                        color="white"
                        fontSize="sm"
                        px={4}
                        py={2}
                        borderRadius="md"
                        boxShadow="md"
                      >
                        <Button
                          w="100%"
                          leftIcon={<FaTerminal fontSize="1.2rem" />}
                          onClick={handleToggleLogs}
                          size="md"
                          colorScheme="brand"
                          variant="outline"
                          _focusVisible={{
                            outline: "none",
                            background: "transparent",
                          }}
                        />
                      </Tooltip>
                    ) : (
                      <Button
                        w="100%"
                        leftIcon={<FaTerminal />}
                        onClick={handleToggleLogs}
                        size="md"
                        colorScheme="gray"
                        bg={buttonBg}
                        _hover={{
                          boxShadow: "none",
                          outline: "none",
                          border: "none",
                        }}
                        _active={{
                          boxShadow: "none",
                          outline: "none",
                          border: "none",
                        }}
                      />
                    )}
                  </Flex>
                </Flex>
              </Flex>
            </Container>
          </Box>

          {/* Main Content */}
          <Container
            maxW={{ base: "100%", md: "6xl" }}
            pt={{ base: "80px", md: "100px" }}
            pb={6}
          >
            {isSessionLoading && (
              <Flex justify="center" py={4}>
                <Spinner size="xl" color="brand.500" />
              </Flex>
            )}

            {sessionError && !isSessionLoading && (
              <Alert status="error" mb={4} borderRadius="md">
                <AlertIcon />
                {sessionError}
                <Button
                  ml={4}
                  size="sm"
                  colorScheme="red"
                  onClick={retrySession}
                  isLoading={isSessionLoading}
                >
                  Retry
                </Button>
              </Alert>
            )}

            {!isSessionLoading && !sessionError && (
              <Flex
                direction={{ base: "column", md: "row" }}
                position="relative"
                minH={{ base: "auto", md: "calc(100vh - 200px)" }}
              >
                <Box flex="1" maxWidth="100%" minH={0}>
                  {inquiries.length > 0 && (
                    <Heading
                      size="md"
                      color={resultsHeadingColor}
                      mb={3}
                    >
                      Results
                    </Heading>
                  )}
                  <ResultsDisplay
                    inquiries={inquiries}
                    streamedText={streamedText}
                    latestInquiryId={latestInquiryId}
                    onExampleClick={handleExampleClick}
                  />
                </Box>

                {isLogOpen && (
                  <Box
                    position={{ md: "fixed" }}
                    top={{ md: "130px" }}
                    right={{ md: 0 }}
                    width={{ base: "100%", md: isLogOpen ? "280px" : "0" }}
                    maxWidth={{ md: "300px" }}
                    height={{ base: "300px", md: "calc(100vh - 320px)" }}
                    bg={"transparent"}
                    transition="width 0.3s ease-in-out"
                    overflow="hidden"
                    zIndex="1000"
                    mb={{ base: 20, md: 0 }}
                  >
                    <EventLog
                      isOpen={isLogOpen}
                      onToggle={handleToggleLogs}
                      eventLogs={eventLogs ?? []}
                    />
                  </Box>
                )}
              </Flex>
            )}
          </Container>

          {/* Fixed Inquiry Form */}
          <Box
            position="fixed"
            bottom={0}
            left={0}
            right={0}
            bg="transparent"
            boxShadow="none"
            borderTop="none"
            zIndex={{ base: 1200, md: "docked" }}
            p={{ base: 0, md: 4 }}
            overflowX="hidden"
          >
            <Container maxW={{ base: "100%", md: "container.lg" }} px={0}>
              <InquiryForm
                sessionId={sessionId}
                question={question}
                setQuestion={setQuestion}
                loading={loading}
                submitInquiry={submitInquiry}
              />
            </Container>
          </Box>
        </Box>
      </ErrorBoundary>
    </ChakraProvider>
  );
};

export default App;
