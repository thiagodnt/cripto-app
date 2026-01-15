import { useEffect, useState, type FormEvent } from 'react';
import styles from './home.module.css';
import { BsSearch } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router';
import type { CoinProps } from '../../types/coin';

interface DataProps {
	data: CoinProps[];
}

export function Home() {
	const [search, setSearch] = useState('');
	const [coins, setCoins] = useState<CoinProps[]>([]);
	const [offset, setOffset] = useState(0);
	const navigate = useNavigate();

	useEffect(() => {
		async function getData() {
			try {
				const API_URL = import.meta.env.VITE_COINCAP_API_URL;
				const API_KEY = import.meta.env.VITE_COINCAP_API_KEY;

				const response = await fetch(
					`${API_URL}/assets?limit=10&offset=${offset}`,
					{
						headers: {
							Authorization: `Bearer ${API_KEY}`,
						},
					}
				);

				if (!response.ok) {
					throw new Error('Erro ao obter os dados da API');
				}

				const data: DataProps = await response.json();
				const coinsData = data.data;

				const price = Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'USD',
				});

				const compactedPrice = Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'USD',
					notation: 'compact',
				});

				const formattedResults = coinsData.map((item) => {
					const formatted = {
						...item,
						formattedPrice: price.format(Number(item.priceUsd)),
						formattedMarketCap: compactedPrice.format(
							Number(item.marketCapUsd)
						),
						formattedVolume: compactedPrice.format(
							Number(item.volumeUsd24Hr)
						),
					};

					return formatted;
				});

				const coinsList = [...coins, ...formattedResults];
				setCoins(coinsList);
			} catch (error) {
				if (error instanceof Error) {
					console.log(error.message);
				} else {
					console.log('Erro desconhecido');
				}
			}
		}

		getData();
	}, [offset]);

	function handleSubmit(e: FormEvent) {
		e.preventDefault();

		if (search === '') {
			return;
		}

		navigate(`/detail/${search}`);
	}

	function handleLoadMore() {
		if (offset === 0) {
			setOffset(10);
			return;
		}

		setOffset(offset + 10);
	}

	return (
		<main className={styles.container}>
			<form className={styles.form} onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Digite aqui o nome da moeda (Ex: BitCoin)"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<button type="submit">
					<BsSearch size={30} color="#FFF" />
				</button>
			</form>

			<table>
				<thead>
					<tr>
						<th scope="col">Moeda</th>
						<th scope="col">Valor Mercado</th>
						<th scope="col">Preço</th>
						<th scope="col">Volume</th>
						<th scope="col">Mudança 24h</th>
					</tr>
				</thead>
				<tbody>
					{coins.length > 0 &&
						coins.map((coin) => (
							<tr className={styles.tr} key={coin.id}>
								<td className={styles.tdLabel} data-label="Moeda">
									<div className={styles.name}>
										<img
											className={styles.coinImg}
											src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLocaleLowerCase()}@2x.png`}
											alt="Logo Moeda"
										/>
										<Link to={`/detail/${coin.id}`}>
											<span>{coin.name}</span> | {coin.symbol}
										</Link>
									</div>
								</td>
								<td
									className={styles.tdLabel}
									data-label="Valor Mercado"
								>
									{coin.formattedMarketCap}
								</td>
								<td className={styles.tdLabel} data-label="Preço">
									{coin.formattedPrice}
								</td>
								<td className={styles.tdLabel} data-label="Volume">
									{coin.formattedVolume}
								</td>
								<td
									className={
										Number(coin.changePercent24Hr) > 0
											? styles.tdProfit
											: styles.tdLoss
									}
									data-label="Mudança 24h"
								>
									<span>{`${Number(coin.changePercent24Hr).toFixed(
										2
									)}%`}</span>
								</td>
							</tr>
						))}
				</tbody>
			</table>

			<button className={styles.btnLoadMore} onClick={handleLoadMore}>
				Carregar Mais...
			</button>
		</main>
	);
}
