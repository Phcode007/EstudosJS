'use client';

import { useState, useEffect } from 'react';
import { CATEGORIES } from '@/app/types/transaction';
import styles from './page.module.css';

export default function CategoriesPage() {
  const [incomeCategories, setIncomeCategories] = useState(CATEGORIES.income);
  const [expenseCategories, setExpenseCategories] = useState(CATEGORIES.expense);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#0070f3', type: 'expense' as 'income' | 'expense' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;

    const newCat = {
      id: Date.now().toString(),
      name: newCategory.name,
      color: newCategory.color
    };

    if (newCategory.type === 'income') {
      setIncomeCategories([...incomeCategories, newCat]);
    } else {
      setExpenseCategories([...expenseCategories, newCat]);
    }

    setNewCategory({ name: '', color: '#0070f3', type: 'expense' });
  };

  const handleEditCategory = (id: string, type: 'income' | 'expense') => {
    setEditingId(id);
  };

  const handleSaveEdit = (id: string, type: 'income' | 'expense', newName: string, newColor: string) => {
    if (type === 'income') {
      setIncomeCategories(incomeCategories.map(cat => 
        cat.id === id ? { ...cat, name: newName, color: newColor } : cat
      ));
    } else {
      setExpenseCategories(expenseCategories.map(cat => 
        cat.id === id ? { ...cat, name: newName, color: newColor } : cat
      ));
    }
    setEditingId(null);
  };

  const handleDeleteCategory = (id: string, type: 'income' | 'expense') => {
    if (type === 'income') {
      setIncomeCategories(incomeCategories.filter(cat => cat.id !== id));
    } else {
      setExpenseCategories(expenseCategories.filter(cat => cat.id !== id));
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🏷️ Gerenciar Categorias</h1>
        <p className={styles.subtitle}>
          Organize suas receitas e despesas por categorias
        </p>
      </header>

      <div className={styles.content}>
        {/* Formulário para adicionar nova categoria */}
        <div className={styles.addCategoryCard}>
          <h3>➕ Adicionar Nova Categoria</h3>
          <div className={styles.addForm}>
            <input
              type="text"
              placeholder="Nome da categoria"
              value={newCategory.name}
              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              className={styles.input}
            />
            <div className={styles.colorInput}>
              <label>Cor:</label>
              <input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                className={styles.colorPicker}
              />
              <span className={styles.colorValue}>{newCategory.color}</span>
            </div>
            <div className={styles.typeSelector}>
              <button
                className={`${styles.typeButton} ${newCategory.type === 'income' ? styles.active : ''}`}
                onClick={() => setNewCategory({...newCategory, type: 'income'})}
              >
                Receita
              </button>
              <button
                className={`${styles.typeButton} ${newCategory.type === 'expense' ? styles.active : ''}`}
                onClick={() => setNewCategory({...newCategory, type: 'expense'})}
              >
                Despesa
              </button>
            </div>
            <button onClick={handleAddCategory} className={styles.addButton}>
              Adicionar Categoria
            </button>
          </div>
        </div>

        {/* Grid de categorias */}
        <div className={styles.categoriesGrid}>
          {/* Categorias de Receita */}
          <div className={styles.categorySection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>💰</span>
              Categorias de Receita
            </h3>
            <div className={styles.categoriesList}>
              {incomeCategories.map(category => (
                <div key={category.id} className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <div className={styles.categoryColor} style={{ backgroundColor: category.color }}></div>
                    {editingId === category.id ? (
                      <input
                        type="text"
                        defaultValue={category.name}
                        className={styles.editInput}
                        onBlur={(e) => handleSaveEdit(category.id, 'income', e.target.value, category.color)}
                      />
                    ) : (
                      <span className={styles.categoryName}>{category.name}</span>
                    )}
                  </div>
                  <div className={styles.categoryActions}>
                    {editingId === category.id ? (
                      <button 
                        onClick={() => handleSaveEdit(category.id, 'income', category.name, category.color)}
                        className={styles.saveButton}
                      >
                        ✅
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEditCategory(category.id, 'income')}
                        className={styles.editButton}
                      >
                        ✏️
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteCategory(category.id, 'income')}
                      className={styles.deleteButton}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categorias de Despesa */}
          <div className={styles.categorySection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>💸</span>
              Categorias de Despesa
            </h3>
            <div className={styles.categoriesList}>
              {expenseCategories.map(category => (
                <div key={category.id} className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <div className={styles.categoryColor} style={{ backgroundColor: category.color }}></div>
                    {editingId === category.id ? (
                      <input
                        type="text"
                        defaultValue={category.name}
                        className={styles.editInput}
                        onBlur={(e) => handleSaveEdit(category.id, 'expense', e.target.value, category.color)}
                      />
                    ) : (
                      <span className={styles.categoryName}>{category.name}</span>
                    )}
                  </div>
                  <div className={styles.categoryActions}>
                    {editingId === category.id ? (
                      <button 
                        onClick={() => handleSaveEdit(category.id, 'expense', category.name, category.color)}
                        className={styles.saveButton}
                      >
                        ✅
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEditCategory(category.id, 'expense')}
                        className={styles.editButton}
                      >
                        ✏️
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteCategory(category.id, 'expense')}
                      className={styles.deleteButton}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Estatísticas de uso */}
        <div className={styles.usageStats}>
          <h3>📊 Estatísticas de Uso</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{incomeCategories.length}</div>
              <div className={styles.statLabel}>Categorias de Receita</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{expenseCategories.length}</div>
              <div className={styles.statLabel}>Categorias de Despesa</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{incomeCategories.length + expenseCategories.length}</div>
              <div className={styles.statLabel}>Total de Categorias</div>
            </div>
          </div>
        </div>

        {/* Dicas */}
        <div className={styles.tips}>
          <h4>💡 Dicas para categorização</h4>
          <ul>
            <li>Mantenha nomes de categorias claros e consistentes</li>
            <li>Use cores diferentes para fácil identificação</li>
            <li>Crie categorias específicas para seus gastos principais</li>
            <li>Revise e ajuste categorias periodicamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}