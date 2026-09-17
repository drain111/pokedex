<!-- EvolutionNode.vue -->
<script setup lang="ts">
defineOptions({ name: 'EvolutionNode' })
import type {ChainLink} from '../composables/usePokemonDetail'

interface Props {
     node:ChainLink 
    }
defineProps<Props>()

function getEvoSprite(name: string) {
  const idMatch = name.match(/(\d+)\/?$/);
  if (idMatch) return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${idMatch[1]}.png`
  return ''
}
</script>

<template>
  <div class="evo-node">
    <div class="species">
      <img :src="getEvoSprite(node.species.url)" />
      <span>{{ node.species.name }}</span>
    </div>

    <div class="children" v-if="node.evolves_to?.length">
      <div v-for="child in node.evolves_to" :key="child.species.name" class="branch  evo-node">
        <span class="method">{{ child.evolution_method }}</span>
        <EvolutionNode :node="child" />
      </div>
    </div>
  </div>
</template>
<style scoped>
.evo-node {
  display: flex;
  justify-content: center;
  align-items: center;
}
.method {
    background: gray;
}
</style>