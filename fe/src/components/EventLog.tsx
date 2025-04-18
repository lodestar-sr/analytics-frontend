import {
  Box,
  Text,
  VStack,
  useColorModeValue,
  Flex,
  Icon,
  Heading,
  Code,
  Button,
  SlideFade,
  Tooltip,
} from "@chakra-ui/react";
import { FaCircle, FaTerminal } from "react-icons/fa";
import { useRef, useEffect } from "react";

const EventLog: React.FC<{
  eventLogs: any[];
  isOpen: boolean;
  onToggle: () => void;
}> = ({ eventLogs, isOpen, onToggle }) => {
  const terminalBg = useColorModeValue("gray.900", "black");
  const terminalHeaderBg = useColorModeValue("gray.800", "gray.900");
  const textColor = useColorModeValue("green.300", "green.400");
  const secondaryTextColor = useColorModeValue("gray.400", "gray.500");
  const timestampColor = useColorModeValue("blue.300", "blue.200");
  const borderColor = useColorModeValue("gray.700", "gray.800");
  const buttonBg = useColorModeValue("gray.200", "gray.700");

  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  }, [eventLogs]);

  return (
    <Box height={!isOpen && eventLogs.length === 0 ? "50px" : "auto"}>
      {isOpen ? (
        <SlideFade in={isOpen} offsetY="20px">
          <Box
            borderRadius="md"
            overflow="hidden"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="md"
          >
            <Flex
              bg={terminalHeaderBg}
              p={2}
              justifyContent="space-between"
              alignItems="center"
            >
              <Flex gap={2}>
                <Icon
                  as={FaCircle}
                  color="red.500"
                  boxSize={3}
                  cursor="pointer"
                  _hover={{ opacity: 0.8 }}
                  onClick={onToggle}
                />
                <Icon as={FaCircle} color="yellow.500" boxSize={3} />
                <Icon as={FaCircle} color="green.500" boxSize={3} />
              </Flex>
              <Heading size="xs" color={secondaryTextColor}>
                System Logs {eventLogs.length > 0 && `(${eventLogs.length})`}
              </Heading>
              <Box w={12}></Box>
            </Flex>

            <Box
              ref={logsContainerRef}
              bg={terminalBg}
              p={4}
              height={isOpen ? "540px" : "100px"}
              overflowY="auto"
              fontFamily="mono"
            >
              <VStack spacing={2} align="stretch">
                {eventLogs.length === 0 ? (
                  <Text color={secondaryTextColor}>No events yet.</Text>
                ) : (
                  eventLogs.map((log) => (
                    <Box key={log.id}>
                      <Flex alignItems="baseline" gap={2}>
                        <Text color={timestampColor} fontSize="xs">
                          [{new Date(log.timestamp).toLocaleString()}]
                        </Text>
                      </Flex>
                      <Code
                        bg="transparent"
                        color={textColor}
                        children={log.message}
                        display="block"
                        whiteSpace="pre-wrap"
                      />
                    </Box>
                  ))
                )}
              </VStack>
            </Box>
          </Box>
        </SlideFade>
      ) : (
        <Flex
          justifyContent="center"
          alignItems="center"
          height={eventLogs.length === 0 ? "50px" : "auto"}
          my={0}
        >
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
              leftIcon={<FaTerminal />}
              onClick={onToggle}
              size="sm"
              colorScheme="gray"
              bg={buttonBg}
              _hover={{ bg: useColorModeValue("gray.300", "gray.600") }}
            />
          </Tooltip>
        </Flex>
      )}
    </Box>
  );
};

export default EventLog;
