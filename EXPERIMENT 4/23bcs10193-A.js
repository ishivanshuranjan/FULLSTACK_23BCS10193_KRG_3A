const express = require('express');
const app = express();
app.use(express.json());

let cards = [
  { id: 1, suit: 'Hearts', value: 'A' },
  { id: 2, suit: 'Spades', value: '10' },
  { id: 3, suit: 'Diamonds', value: 'K' }
];

app.get('/cards', (req, res) => res.json(cards));

app.get('/cards/:id', (req, res) => {
  const card = cards.find(c => c.id === parseInt(req.params.id));
  card ? res.json(card) : res.status(404).send('Card not found');
});

app.post('/cards', (req, res) => {
  const { suit, value } = req.body;
  const newCard = { id: cards.length + 1, suit, value };
  cards.push(newCard);
  res.status(201).json(newCard);
});

app.put('/cards/:id', (req, res) => {
  const card = cards.find(c => c.id === parseInt(req.params.id));
  if (!card) return res.status(404).send('Card not found');
  const { suit, value } = req.body;
  card.suit = suit;
  card.value = value;
  res.json(card);
});

app.delete('/cards/:id', (req, res) => {
  const index = cards.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).send('Card not found');
  const deletedCard = cards.splice(index, 1);
  res.json(deletedCard);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
