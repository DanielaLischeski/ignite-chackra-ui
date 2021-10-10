import { Flex, Box, Text, Avatar } from "@chakra-ui/react";
import React from "react";

interface ProfileProps {
	showProfileData?: boolean;
}

export function Profile({ showProfileData = true }: ProfileProps) {
	return (
		<Flex align="center">

			{showProfileData && (
				<Box mr="4" textAlign="right">
					<Text>Daniela Lischeski</Text>
					<Text color="gray.300" fontSize="small">dani@gmail</Text>
				</Box>)}

			<Avatar size="md" name="Daniela Lischeski" src="https://github.com/DanielaLischeski.png" />

		</Flex>
	);
}