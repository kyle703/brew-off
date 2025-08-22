import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadData } from "../data/fetch";
import type { Beer, LoadedData, WinnerCategory } from "../types";
import CategoryPlacard from "../components/CategoryPlacard";
import { hasSeenReveal } from "../utils/cookies";

const CATEGORIES: WinnerCategory[] = ["Overall", "Label", "Color", "Drinkability", "Flavor"];

// Sample data for when no real data is available
const SAMPLE_BEERS: Beer[] = [
	{
		entryId: "B-001",
		name: "Libre",
		brewer: "macho",
		style: "Lager",
		abv: 5.2,
		img: undefined,
		scores: { drinkability: 9.2, flavor: 8.8, color: 9.1, label: 9.4, overall: 9.1, votes: 24, total: 218.4 }
	},
	{
		entryId: "B-002", 
		name: "Saison d'Été",
		brewer: "Ava",
		style: "Saison",
		abv: 6.8,
		img: undefined,
		scores: { drinkability: 8.9, flavor: 9.2, color: 8.7, label: 8.9, overall: 8.9, votes: 22, total: 195.8 }
	},
	{
		entryId: "B-003",
		name: "Kölsch",
		brewer: "Alfonso", 
		style: "Kölsch",
		abv: 4.8,
		img: undefined,
		scores: { drinkability: 8.5, flavor: 8.3, color: 8.6, label: 8.5, overall: 8.5, votes: 20, total: 170.0 }
	},
	{
		entryId: "B-004",
		name: "Weiswein",
		brewer: "carl",
		style: "Wheat Wine", 
		abv: 6.2,
		img: undefined,
		scores: { drinkability: 8.4, flavor: 8.1, color: 8.3, label: 8.4, overall: 8.3, votes: 18, total: 149.4 }
	},
	{
		entryId: "B-005",
		name: "Maibock",
		brewer: "Max",
		style: "Bock",
		abv: 6.5,
		img: undefined,
		scores: { drinkability: 8.2, flavor: 7.9, color: 8.0, label: 8.2, overall: 8.1, votes: 16, total: 129.6 }
	},
	{
		entryId: "B-006",
		name: "Tenacious",
		brewer: "Gisela",
		style: "IPA",
		abv: 7.1,
		img: undefined,
		scores: { drinkability: 8.0, flavor: 7.7, color: 7.8, label: 8.0, overall: 7.9, votes: 14, total: 110.6 }
	},
	{
		entryId: "B-007",
		name: "Golden Hour",
		brewer: "Felix",
		style: "Golden Ale",
		abv: 5.5,
		img: undefined,
		scores: { drinkability: 7.8, flavor: 7.5, color: 7.6, label: 7.8, overall: 7.7, votes: 12, total: 92.4 }
	},
	{
		entryId: "B-008",
		name: "Midnight Stout",
		brewer: "Luna",
		style: "Imperial Stout",
		abv: 8.2,
		img: undefined,
		scores: { drinkability: 7.6, flavor: 7.3, color: 7.4, label: 7.6, overall: 7.5, votes: 10, total: 75.0 }
	},
	{
		entryId: "B-009",
		name: "Citrus Blonde",
		brewer: "Marco",
		style: "Blonde Ale",
		abv: 4.9,
		img: undefined,
		scores: { drinkability: 7.4, flavor: 7.1, color: 7.2, label: 7.4, overall: 7.3, votes: 8, total: 58.4 }
	},
	{
		entryId: "B-010",
		name: "Hazy Dreams",
		brewer: "Zoe",
		style: "Hazy IPA",
		abv: 6.7,
		img: undefined,
		scores: { drinkability: 7.2, flavor: 6.9, color: 7.0, label: 7.2, overall: 7.1, votes: 6, total: 42.6 }
	}
];

export default function Leaderboard() {
	const [data, setData] = useState<LoadedData | null>(null);
	const [err, setErr] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		// Check if reveal has been seen, redirect if not
		if (!hasSeenReveal()) {
			navigate('/reveal');
			return;
		}

		loadData()
			.then((d) => setData(d))
			.catch((e) => setErr(String(e)));
	}, [navigate]);

	if (err) return <div style={{ color: "tomato" }}>Error: {err}</div>;
	if (!data) return <div className="min-h-[60vh] flex items-center justify-center text-amber-200">Loading…</div>;

	// Use sample data if beerList is empty, otherwise use real data
	const rows: Beer[] = data.beerList.length > 0 ? data.beerList : SAMPLE_BEERS;

	return (
		<div className="min-h-[calc(100svh-var(--nav-h))] w-full">
			<div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6 sm:py-8">
				<div className="space-y-8 sm:space-y-10">
					{CATEGORIES.map((cat) => (
						<CategoryPlacard key={cat} category={cat} rows={rows} />
					))}
				</div>
				<div className="mt-6 text-center text-amber-200/60 text-xs">
					{data.beerList.length > 0 ? (
						`Results generated at: ${new Date(data.generatedAt).toLocaleString()}`
					) : (
						"Displaying sample data - no real results available"
					)}
				</div>
			</div>
		</div>
	);
}
