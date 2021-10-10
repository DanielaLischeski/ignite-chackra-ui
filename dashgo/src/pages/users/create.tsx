import { Box, Button, Divider, Flex, Heading, HStack, SimpleGrid, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { Input } from "../../components/Form/Input";
import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from "react-hook-form";
import { SubmitHandler } from "react-hook-form";
import { useMutation } from 'react-query'
import { api } from "../../services/api";
import { queryClient } from "../../services/mirage/QueryClient";
import { useRouter } from "next/router";

type CreateUserFormData = {
	email: string;
	nome: string;
	password: string;
	password_confirmation: string;
}

const createUserFormSchema = yup.object().shape({
	name: yup.string().required('Nome obrigatório'),
	email: yup.string().required('E-mail obrigatório').email('E-mail inválido'),
	password: yup.string().required('Senha obrigatória').min(6, 'No mínimo 6 caracteres'),
	password_confirmation: yup.string().oneOf([null, yup.ref('password')], 'As senhas precisam ser iguais'),

})

export default function CreateUser() {

	const createUser = useMutation(async (user: CreateUserFormData) => {
		const response = await api.post('users', {
			user: {
				...user,
				create_at: new Date(),
			}
		})

		return response.data.user;
	},
		{
			onSuccess: () => {
				// invalida o cache de user, para forçar nova busca e aparecer o novo registro
				queryClient.invalidateQueries('users')
			}
		})



	const { register, handleSubmit, formState } = useForm({
		resolver: yupResolver(createUserFormSchema)
	})

	const router = useRouter();

	const handleCreateUser: SubmitHandler<CreateUserFormData> = async (values) => {

		await createUser.mutateAsync(values);

		router.push('/users')

	}

	return (
		<Box>
			<Header />
			<Flex w="100%" my="6" maxWidth={1480} mx="auto" px="6">
				<Sidebar />
				<Box as="form" flex="1" borderRadius={8} bg="gray.800" p="8" onSubmit={handleSubmit(handleCreateUser)}>
					<Heading size="lg" fontWeight="normal">Criar usuário</Heading>
					<Divider my="6" borderColor="gray.700" />

					<VStack spacing="8">
						<SimpleGrid minChildWidth="240px" spacing={["6", "8"]} w="100%">
							<Input name="name" label="Nome completo" {...register('name')} error={formState.errors.name} />
							<Input name="email" type="email" label="E-mail"  {...register('email')} error={formState.errors.email} />
						</SimpleGrid>

						<SimpleGrid minChildWidth="240px" spacing={["6", "8"]} w="100%">
							<Input name="password" type="password" label="Senha" {...register('password')} error={formState.errors.password} />
							<Input name="password_confirmation" type="password" label="Confirmação da senha" {...register('password_confirmation')} error={formState.errors.password_confirmation} />
						</SimpleGrid>
					</VStack>
					<Flex mt="8" justify="flex-end">
						<HStack spacing="4">
							<Link href="/users" passHref>
								<Button as="a" colorScheme="whiteAlpha">Cancelar</Button>
							</Link>
							<Button colorScheme="pink" type="submit" isLoading={formState.isSubmitting}>Salvar</Button>

						</HStack>

					</Flex>

				</Box>
			</Flex>
		</Box>
	)
}