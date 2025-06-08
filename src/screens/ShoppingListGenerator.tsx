import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

// --- Interfaces de données mises à jour pour correspondre à ta structure ---
interface RawIngredient {
  id: string;
  quantite: number;
  unite: string;
  commentaire: string;
}

interface Dish {
  id: string;
  nom: string; // 'nom' au lieu de 'name'
  type: string;
  image: string;
  ingredients: RawIngredient[];
}

interface MasterIngredient {
  id: string;
  nom: string; // 'nom' au lieu de 'name'
  image: string;
  prixUnitaire: number;
}

interface ShoppingListGeneratorProps {
  dish: Dish | null;
  allIngredients: MasterIngredient[]; // Ajout de tous les ingrédients pour lookup
  onClose: () => void;
}

interface ShoppingListItem {
  id: string; // L'ID de l'ingrédient principal
  name: string;
  totalQuantity: number;
  unit: string;
  pricePerUnit: number; // Prix unitaire de l'ingrédient
}

const ShoppingListGenerator: React.FC<ShoppingListGeneratorProps> = ({ dish, allIngredients, onClose }) => {
  const [shoppingList, setShoppingList] = React.useState<ShoppingListItem[]>([]);

  React.useEffect(() => {
    if (dish) {
      generateList(dish, allIngredients);
    } else {
      setShoppingList([]);
    }
  }, [dish, allIngredients]); // Dépendance à allIngredients aussi

  const generateList = (currentDish: Dish, ingredientsData: MasterIngredient[]) => {
    const aggregatedIngredients: { [key: string]: { quantity: number; unit: string; id: string; pricePerUnit: number } } = {};

    currentDish.ingredients.forEach(rawIngredient => {
      const masterIngredient = ingredientsData.find(ing => ing.id === rawIngredient.id);

      if (masterIngredient) {
        const key = `${masterIngredient.nom.toLowerCase()}-${rawIngredient.unite.toLowerCase()}`;
        if (aggregatedIngredients[key]) {
          aggregatedIngredients[key].quantity += rawIngredient.quantite;
        } else {
          aggregatedIngredients[key] = {
            id: masterIngredient.id,
            quantity: rawIngredient.quantite,
            unit: rawIngredient.unite,
            pricePerUnit: masterIngredient.prixUnitaire,
          };
        }
      } else {
        console.warn(`Ingrédient avec l'ID ${rawIngredient.id} non trouvé dans la liste des ingrédients principaux.`);
        // Fallback si l'ingrédient n'est pas dans la liste principale
        const fallbackKey = `inconnu-${rawIngredient.id}-${rawIngredient.unite.toLowerCase()}`;
        if (aggregatedIngredients[fallbackKey]) {
          aggregatedIngredients[fallbackKey].quantity += rawIngredient.quantite;
        } else {
          aggregatedIngredients[fallbackKey] = {
            id: rawIngredient.id,
            quantity: rawIngredient.quantite,
            unit: rawIngredient.unite,
            pricePerUnit: 0, // Prix inconnu
          };
        }
      }
    });

    const newShoppingList: ShoppingListItem[] = Object.keys(aggregatedIngredients).map(key => {
      const aggregated = aggregatedIngredients[key];
      const ingredientName = ingredientsData.find(ing => ing.id === aggregated.id)?.nom || key.split('-')[0]; // Utilise le nom de l'ingrédient principal ou le début de la clé
      return {
        id: aggregated.id,
        name: ingredientName.charAt(0).toUpperCase() + ingredientName.slice(1),
        totalQuantity: aggregated.quantity,
        unit: aggregated.unit,
        pricePerUnit: aggregated.pricePerUnit,
      };
    });

    setShoppingList(newShoppingList);
  };

  if (!dish) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDishText}>Sélectionnez un plat pour générer la liste de courses.</Text>
      </View>
    );
  }

  const calculateTotalPrice = () => {
    return shoppingList.reduce((sum, item) => sum + (item.totalQuantity * item.pricePerUnit), 0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Liste de courses pour "{dish.nom}"</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Feather name="x" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      {shoppingList.length > 0 ? (
        <>
          <FlatList
            data={shoppingList}
            keyExtractor={(item) => item.id} // Utilise l'ID de l'ingrédient comme clé
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.itemText}>{item.name}</Text>
                <Text style={styles.itemQuantity}>{item.totalQuantity} {item.unit}</Text>
                {item.pricePerUnit > 0 && (
                  <Text style={styles.itemPrice}>({item.pricePerUnit * item.totalQuantity} FCFA)</Text>
                )}
              </View>
            )}
            style={styles.list}
          />
          <View style={styles.totalPriceContainer}>
            <Text style={styles.totalPriceText}>Coût total estimé : {calculateTotalPrice()} FCFA</Text>
          </View>
        </>
      ) : (
        <Text style={styles.emptyListText}>Aucun ingrédient pour ce plat.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  list: {
    flexGrow: 0,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#739F12',
    marginRight: 10,
  },
  itemPrice: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  noDishText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#777',
  },
  emptyListText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
  },
  totalPriceContainer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D820D',
  },
});

export default ShoppingListGenerator;