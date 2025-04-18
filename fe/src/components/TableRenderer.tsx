import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { ArrowUp, ArrowDown, MoveVertical } from "lucide-react";

import { useState, useMemo } from "react";

interface TableRendererProps {
  tableData: any[];
}

type SortDirection = "asc" | "desc";

const TableRenderer: React.FC<TableRendererProps> = ({ tableData }) => {
  if (!tableData || tableData.length === 0) return null;

  const headers = Object.keys(tableData[0]);

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedData = useMemo(() => {
    if (!sortKey) return tableData;

    const sorted = [...tableData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return sorted;
  }, [tableData, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (key: string) => {
    if (key === sortKey) {
      return sortDirection === "asc" ? (
        <ArrowUp size={16} className="ml-1" />
      ) : (
        <ArrowDown size={16} className="ml-1" />
      );
    }

    return <MoveVertical size={16} className="ml-1 text-gray-400" />;
  };

  const headerBg = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const rowBg = useColorModeValue("white", "gray.800");
  const rowHoverBg = useColorModeValue("gray.50", "gray.700");
  const zebraBg = useColorModeValue("gray.50", "gray.900");

  return (
    <TableContainer
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflowX="auto"
      boxShadow="sm"
    >
      <Table variant="simple" colorScheme="gray">
        <Thead bg={headerBg}>
          <Tr>
            {headers.map((header) => (
              <Th
                key={header}
                onClick={() => handleSort(header)}
                cursor="pointer"
                color={textColor}
                fontSize={{ base: "sm", md: "md" }}
                textTransform="capitalize"
                borderColor={borderColor}
                px={{ base: 2, md: 4 }}
                py={3}
                _hover={{ textDecoration: "underline" }}
              >
                <Flex align="center">
                  {header}
                  {getSortIcon(header)}
                </Flex>
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {sortedData.map((row, idx) => (
            <Tr
              key={idx}
              bg={idx % 2 === 0 ? rowBg : zebraBg}
              _hover={{ bg: rowHoverBg }}
              transition="background-color 0.2s"
            >
              {headers.map((header) => (
                <Td
                  key={header}
                  color={textColor}
                  borderColor={borderColor}
                  fontSize={{ base: "sm", md: "md" }}
                  px={{ base: 2, md: 4 }}
                  py={3}
                >
                  {row[header]}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default TableRenderer;
