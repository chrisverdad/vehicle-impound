import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useImpoundStore = defineStore('impound', () => {
  const impoundList = ref<any[]>([]);

  const addRecord = (record: any) => {
    const newId = impoundList.value.length > 0
      ? Math.max(...impoundList.value.map(r => r.id)) + 1
      : 1;
    impoundList.value.push({ ...record, id: newId });
    return newId;
  };

  const updateRecord = (id: number, updatedRecord: any) => {
    const index = impoundList.value.findIndex(r => r.id === id);
    if (index !== -1) impoundList.value[index] = { ...updatedRecord };
  };

  const deleteRecord = (id: number) => {
    impoundList.value = impoundList.value.filter(r => r.id !== id);
  };

  return { impoundList, addRecord, updateRecord, deleteRecord };
});