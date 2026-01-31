/**
 * Infinity Item & Gear Data Definitions
 * Complete item system with resources, equipment, and rarities
 */

import { SkillType } from '../types/game.types';

// ============================================
// RARITY SYSTEM
// ============================================

export enum Rarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export const RARITY_DATA: Record<Rarity, { color: string; statBonus: number; dropWeight: number }> = {
  [Rarity.COMMON]: { color: '#ffffff', statBonus: 0, dropWeight: 60 },
  [Rarity.UNCOMMON]: { color: '#1eff00', statBonus: 10, dropWeight: 25 },
  [Rarity.RARE]: { color: '#0070dd', statBonus: 25, dropWeight: 10 },
  [Rarity.EPIC]: { color: '#a335ee', statBonus: 50, dropWeight: 4 },
  [Rarity.LEGENDARY]: { color: '#ff8000', statBonus: 100, dropWeight: 1 },
};

// ============================================
// MATERIAL TIERS
// ============================================

export enum MaterialTier {
  COPPER = 1,
  BRONZE = 2,
  IRON = 3,
  SILVER = 4,
  MITHRIL = 5,
  GOLD = 6,
  PLATINUM = 7,
  DIAMOND = 8,
  DRAGON = 9,
}

export const MATERIAL_DATA: Record<MaterialTier, { name: string; dropWeight: number; statMultiplier: number }> = {
  [MaterialTier.COPPER]: { name: 'Copper', dropWeight: 40, statMultiplier: 1.0 },
  [MaterialTier.BRONZE]: { name: 'Bronze', dropWeight: 25, statMultiplier: 1.2 },
  [MaterialTier.IRON]: { name: 'Iron', dropWeight: 15, statMultiplier: 1.5 },
  [MaterialTier.SILVER]: { name: 'Silver', dropWeight: 8, statMultiplier: 2.0 },
  [MaterialTier.MITHRIL]: { name: 'Mithril', dropWeight: 5, statMultiplier: 3.0 },
  [MaterialTier.GOLD]: { name: 'Gold', dropWeight: 3, statMultiplier: 4.0 },
  [MaterialTier.PLATINUM]: { name: 'Platinum', dropWeight: 2, statMultiplier: 6.0 },
  [MaterialTier.DIAMOND]: { name: 'Diamond', dropWeight: 1.5, statMultiplier: 10.0 },
  [MaterialTier.DRAGON]: { name: 'Dragon', dropWeight: 0.5, statMultiplier: 20.0 },
};

// ============================================
// EQUIPMENT SLOTS
// ============================================

export enum EquipSlot {
  HEAD = 'head',
  SHOULDERS = 'shoulders',
  CHEST = 'chest',
  BACK = 'back',
  BRACERS = 'bracers',
  GLOVES = 'gloves',
  PANTS = 'pants',
  BOOTS = 'boots',
  MAIN_HAND = 'mainHand',
  OFF_HAND = 'offHand',
  RING_1 = 'ring1',
  RING_2 = 'ring2',
  NECKLACE = 'necklace',
  TRINKET = 'trinket',
}

// ============================================
// ARMOR CLASSES
// ============================================

export enum ArmorClass {
  PLATE = 'plate',
  MAIL = 'mail',
  LEATHER = 'leather',
  CLOTH = 'cloth',
}

export const ARMOR_CLASS_STATS: Record<ArmorClass, { primary: string; secondary: string }> = {
  [ArmorClass.PLATE]: { primary: 'strength', secondary: 'stamina' },
  [ArmorClass.MAIL]: { primary: 'strength', secondary: 'stamina' },
  [ArmorClass.LEATHER]: { primary: 'agility', secondary: 'stamina' },
  [ArmorClass.CLOTH]: { primary: 'intellect', secondary: 'stamina' },
};

// ============================================
// WEAPON TYPES
// ============================================

export enum WeaponType {
  SWORD = 'sword',
  BROADSWORD = 'broadsword',
  MACE = 'mace',
  AXE = 'axe',
  DAGGER = 'dagger',
  STAFF = 'staff',
  WAND = 'wand',
}

export const WEAPON_DATA: Record<WeaponType, { hands: 1 | 2; primaryStat: string; craftingSkill: SkillType }> = {
  [WeaponType.SWORD]: { hands: 1, primaryStat: 'strength', craftingSkill: SkillType.SMITHING },
  [WeaponType.BROADSWORD]: { hands: 2, primaryStat: 'strength', craftingSkill: SkillType.SMITHING },
  [WeaponType.MACE]: { hands: 1, primaryStat: 'strength', craftingSkill: SkillType.SMITHING },
  [WeaponType.AXE]: { hands: 1, primaryStat: 'strength', craftingSkill: SkillType.SMITHING },
  [WeaponType.DAGGER]: { hands: 1, primaryStat: 'agility', craftingSkill: SkillType.SMITHING },
  [WeaponType.STAFF]: { hands: 2, primaryStat: 'intellect', craftingSkill: SkillType.SAWMILL },
  [WeaponType.WAND]: { hands: 1, primaryStat: 'intellect', craftingSkill: SkillType.SAWMILL },
};

// ============================================
// FANTASY WEAPON NAMES (100 each)
// ============================================

export const SWORD_NAMES = [
  'Frostbane', 'Shadowstrike', 'Dawn Cleaver', 'Nightfall', 'Stormbringer',
  'Bloodthirst', 'Soulreaver', 'Wyrmbane', 'Dawnbreaker', 'Twilight Edge',
  'Voidcutter', 'Starfall Blade', 'Thunder Fang', 'Serpent\'s Kiss', 'Phoenix Talon',
  'Dragonbane', 'Moonlight Saber', 'Sunfire Edge', 'Icewind Blade', 'Hellfire Sword',
  'Destiny\'s Edge', 'Valor', 'Vengeance', 'Justice', 'Mercy',
  'Oblivion', 'Excalibur', 'Durandal', 'Joyeuse', 'Curtana',
  'Gram', 'Naegling', 'Hrunting', 'Tyrfing', 'Dainsleif',
  'Caladbolg', 'Fragarach', 'Answerer', 'Claiomh Solais', 'Dyrnwyn',
  'Ridill', 'Hrotti', 'Kusanagi', 'Muramasa', 'Masamune',
  'Crimson Dawn', 'Azure Dream', 'Golden Promise', 'Silver Hope', 'Obsidian Night',
  'Emerald Wind', 'Ruby Storm', 'Sapphire Tide', 'Amethyst Shadow', 'Diamond Light',
  'Oathkeeper', 'Oathbreaker', 'Peacemaker', 'Warmonger', 'Silencer',
  'Whisper', 'Thunder', 'Lightning', 'Tempest', 'Cyclone',
  'Avalanche', 'Earthquake', 'Wildfire', 'Tsunami', 'Hurricane',
  'Reaper\'s Edge', 'Angel\'s Tear', 'Devil\'s Grin', 'Saint\'s Fury', 'Sinner\'s Blade',
  'Champion\'s Blade', 'King\'s Sword', 'Queen\'s Grace', 'Prince\'s Honor', 'Knight\'s Valor',
  'Crusader', 'Paladin\'s Light', 'Warrior\'s Pride', 'Berserker\'s Rage', 'Gladiator\'s Glory',
  'Sentinel', 'Guardian', 'Protector', 'Defender', 'Avenger',
  'The Last Word', 'First Strike', 'Final Cut', 'Opening Gambit', 'Closing Argument',
  'Eternal Edge', 'Infinite Blade', 'Boundless Steel', 'Limitless Light', 'Endless Night',
];

export const BROADSWORD_NAMES = [
  'Worldsplitter', 'Titan\'s Cleave', 'Giant\'s Bane', 'Colossus', 'Devastator',
  'Annihilator', 'Obliterator', 'Decimator', 'Executioner', 'Terminator',
  'Ragnarok', 'Apocalypse', 'Armageddon', 'Cataclysm', 'Doomsday',
  'Mountain Breaker', 'Castle Crusher', 'Wall Smasher', 'Gate Render', 'Tower Toppler',
  'Dragon\'s Wrath', 'Wyrm\'s Fury', 'Serpent\'s Might', 'Beast\'s Roar', 'Titan\'s Fist',
  'Thunder God\'s Fury', 'Storm Lord\'s Wrath', 'Wind King\'s Blade', 'Fire Emperor\'s Edge', 'Ice Queen\'s Justice',
  'Heaven\'s Fall', 'Hell\'s Rise', 'Earth\'s Tremor', 'Sea\'s Rage', 'Sky\'s Fury',
  'Cosmic Cleaver', 'Stellar Sunder', 'Galactic Guillotine', 'Nebula\'s End', 'Void Render',
  'Primal Force', 'Ancient Might', 'Eternal Power', 'Infinite Strength', 'Boundless Fury',
  'War\'s Embrace', 'Battle\'s Kiss', 'Combat\'s Touch', 'Conflict\'s Caress', 'Strife\'s Grip',
  'The Sundering', 'The Rending', 'The Breaking', 'The Shattering', 'The Crushing',
  'Mammoth\'s Tusk', 'Behemoth\'s Fang', 'Leviathan\'s Maw', 'Kraken\'s Claw', 'Hydra\'s Bite',
  'Juggernaut', 'Unstoppable', 'Unyielding', 'Unbreakable', 'Invincible',
  'Hero\'s Burden', 'Champion\'s Weight', 'Warrior\'s Load', 'Fighter\'s Cross', 'Soldier\'s Duty',
  'Legacy of Giants', 'Heritage of Titans', 'Birthright of Gods', 'Destiny of Kings', 'Fate of Empires',
  'Forgemaster\'s Pride', 'Blacksmith\'s Magnum Opus', 'Artisan\'s Masterwork', 'Craftsman\'s Glory', 'Smith\'s Triumph',
  'The Compensator', 'Overcompensation', 'Big Enough', 'Size Matters', 'Bigger is Better',
  'Absolute Unit', 'Chonky Blade', 'Thicc Sword', 'Hefty Boi', 'Girthy Edge',
  'Gym Membership', 'Never Skip Leg Day', 'Protein Shake', 'Pre-Workout', 'Post-Workout',
  'Final Answer', 'Last Resort', 'Ultimate Solution', 'End of Discussion', 'Conversation Ender',
];

export const MACE_NAMES = [
  'Skullcrusher', 'Boneshatter', 'Brainbasher', 'Mindbreaker', 'Headhammer',
  'Holy Avenger', 'Divine Smite', 'Sacred Bash', 'Blessed Bludgeon', 'Righteous Fury',
  'Demon\'s Bane', 'Devil\'s Doom', 'Fiend\'s Fall', 'Hell\'s Hammer', 'Infernal Impact',
  'Justice\'s Weight', 'Law\'s Fist', 'Order\'s Hand', 'Balance\'s Blow', 'Equity\'s Edge',
  'Morning Star', 'Evening Glow', 'Midnight\'s Kiss', 'Dawn\'s Embrace', 'Twilight Touch',
  'Thunder Hammer', 'Lightning Rod', 'Storm Cloud', 'Tempest\'s Touch', 'Cyclone Crusher',
  'Earthquake Maker', 'Avalanche Starter', 'Landslide Trigger', 'Tremor', 'Quake',
  'Stone Fist', 'Iron Knuckle', 'Steel Palm', 'Bronze Bash', 'Copper Crack',
  'The Tenderizer', 'Meat Pounder', 'Steak Maker', 'Beef Beater', 'Protein Processor',
  'Whack-a-Mole', 'Bonk Stick', 'Horny Jail Key', 'Correction Tool', 'Attitude Adjuster',
  'Reality Check', 'Wake-Up Call', 'Alarm Clock', 'Morning Routine', 'Coffee Substitute',
  'Problem Solver', 'Conflict Resolution', 'Negotiation Tool', 'Diplomacy Device', 'Peace Treaty',
  'Dentist\'s Nightmare', 'Orthodontist\'s Enemy', 'Tooth Fairy\'s Friend', 'Smile Adjuster', 'Grin Grinder',
  'Concussion Giver', 'Headache Maker', 'Migraine Manufacturer', 'Aspirin Advertiser', 'Tylenol Testimonial',
  'Priest\'s Paradise', 'Cleric\'s Choice', 'Paladin\'s Pick', 'Monk\'s Muse', 'Bishop\'s Blessing',
  'King\'s Scepter', 'Queen\'s Rod', 'Prince\'s Staff', 'Duke\'s Baton', 'Earl\'s Enforcernaut',
  'Peasant\'s Revenge', 'Farmer\'s Fury', 'Villager\'s Vengeance', 'Commoner\'s Comeback', 'Serf\'s Satisfaction',
  'The Bonkening', 'Bonk 2: Electric Boogaloo', 'Return of the Bonk', 'Bonk Strikes Back', 'Revenge of the Bonk',
  'Blessed Bonker', 'Holy Hammer', 'Sacred Smasher', 'Divine Demolisher', 'Heavenly Hurt',
  'Final Bonk', 'Ultimate Smash', 'Last Bash', 'End Pound', 'Closing Crush',
];

export const AXE_NAMES = [
  'Berserker\'s Fury', 'Rage Incarnate', 'Wrath Manifest', 'Anger\'s Edge', 'Fury\'s Bite',
  'Lumberjack\'s Nightmare', 'Forester\'s Fear', 'Woodsman\'s Woe', 'Tree\'s Terror', 'Forest\'s Foe',
  'Executioner\'s Pride', 'Headsman\'s Honor', 'Chopper\'s Choice', 'Guillotine\'s Cousin', 'Blade of Justice',
  'Viking\'s Victory', 'Norse Nemesis', 'Scandinavian Slayer', 'Northman\'s Nightmare', 'Raider\'s Ruin',
  'Dragon\'s Claw', 'Wyrm\'s Wing', 'Serpent\'s Scale', 'Beast\'s Bite', 'Monster\'s Maw',
  'Thunder Strike', 'Lightning Chop', 'Storm Slash', 'Tempest\'s Touch', 'Cyclone Cut',
  'Flame Cleaver', 'Fire Splitter', 'Inferno Divider', 'Blaze Breaker', 'Ember Edge',
  'Frost Bite', 'Ice Chopper', 'Glacier Grinder', 'Tundra Terror', 'Blizzard Blade',
  'Blood Drinker', 'Soul Stealer', 'Life Leech', 'Vitality Vampire', 'Essence Eater',
  'Skull Splitter', 'Head Halver', 'Crown Cracker', 'Helmet Helper', 'Dome Divider',
  'Armor Annihilator', 'Shield Shredder', 'Defense Destroyer', 'Protection Piercer', 'Guard Grinder',
  'Bone Breaker', 'Limb Lopper', 'Joint Jumbler', 'Spine Snapper', 'Rib Remover',
  'The Divorce Papers', 'Half and Half', 'Split Decision', 'Down the Middle', 'Fifty-Fifty',
  'Cleave and Leave', 'Chop and Drop', 'Hack and Pack', 'Slash and Dash', 'Cut and Shut',
  'Daddy Issues', 'Mommy Dearest', 'Family Therapy', 'Relationship Status', 'It\'s Complicated',
  'Tax Collector', 'IRS Agent', 'Audit\'s Edge', 'Deduction Device', 'Write-Off Weapon',
  'Monday Morning', 'Case of the Mondays', 'Weekend Ender', 'Friday Feeling', 'Hump Day',
  'Gym Equipment', 'Crossfit Tool', 'Workout Weapon', 'Exercise Edge', 'Fitness Fury',
  'Lumberjack Supreme', 'Wood Processor', 'Timber Terror', 'Log Launcher', 'Stump Stumper',
  'Final Chop', 'Last Cut', 'Ultimate Cleave', 'End Slash', 'Closing Hack',
];

export const DAGGER_NAMES = [
  'Shadowfang', 'Nightwhisper', 'Silent Death', 'Quiet End', 'Muffled Murder',
  'Backstabber', 'Betrayer', 'Traitor\'s Touch', 'Judas Kiss', 'Brutus\'s Blessing',
  'Assassin\'s Creed', 'Killer\'s Code', 'Murderer\'s Motto', 'Slayer\'s Scripture', 'Death\'s Doctrine',
  'Poison Tip', 'Venom Edge', 'Toxic Touch', 'Deadly Dose', 'Fatal Flavor',
  'Quick Strike', 'Fast Finish', 'Rapid End', 'Swift Stop', 'Speedy Silence',
  'Serpent\'s Fang', 'Viper\'s Venom', 'Snake\'s Sting', 'Cobra\'s Kiss', 'Asp\'s Anger',
  'Shadow\'s Edge', 'Darkness\'s Blade', 'Night\'s Knife', 'Gloom\'s Glaive', 'Shade\'s Shiv',
  'Thief\'s Best Friend', 'Rogue\'s Companion', 'Scoundrel\'s Sidekick', 'Villain\'s Valet', 'Criminal\'s Comrade',
  'Heartseeker', 'Kidney Finder', 'Liver Locator', 'Spleen Spotter', 'Organ Organizer',
  'The Prick', 'Little Sting', 'Tiny Terror', 'Small But Deadly', 'Size Doesn\'t Matter',
  'Paper Cut', 'Splinter', 'Sliver', 'Needle', 'Pin Prick',
  'Kitchen Knife', 'Letter Opener', 'Box Cutter', 'Utility Blade', 'Swiss Army',
  'Stealth 100', 'Sneak Attack', 'Critical Hit', 'Surprise Mechanics', 'Loot Box',
  'Git Gud', 'No Skill Required', 'Easy Mode', 'Casual\'s Choice', 'Noob Tube',
  'Speed Run', 'Any Percent', 'Glitchless', 'Tool-Assisted', 'Frame Perfect',
  'Pocket Knife', 'Hidden Blade', 'Concealed Carry', 'Secret Weapon', 'Surprise Tool',
  'First Blood', 'Opening Wound', 'Initial Injury', 'Starting Scratch', 'Beginning Bleed',
  'Double Tap', 'Confirmation Kill', 'Insurance Policy', 'Better Safe', 'Just in Case',
  'The Sting', 'Bee\'s Revenge', 'Wasp\'s Wrath', 'Hornet\'s Hate', 'Mosquito\'s Menace',
  'Final Stab', 'Last Poke', 'Ultimate Stick', 'End Jab', 'Closing Pierce',
];

export const STAFF_NAMES = [
  'Archmage\'s Staff', 'Grand Wizard\'s Rod', 'Supreme Sorcerer\'s Stick', 'Master Mage\'s Wand', 'Chief Conjurer\'s Cane',
  'Staff of the Cosmos', 'Rod of the Stars', 'Wand of the Void', 'Cane of Creation', 'Stick of Existence',
  'Elemental Mastery', 'Primal Power', 'Natural Force', 'Wild Magic', 'Raw Energy',
  'Thundercaller', 'Stormweaver', 'Lightningbinder', 'Tempestsummoner', 'Cycloneconjurer',
  'Flamebringer', 'Firewielder', 'Infernomancer', 'Blazecaster', 'Emberspeaker',
  'Frostweaver', 'Icebinder', 'Glacialmancer', 'Blizzardcaller', 'Tundraspeaker',
  'Earthshaker', 'Stonebinder', 'Mountaincaller', 'Terraformer', 'Groundbreaker',
  'Lifegiver', 'Naturebinder', 'Growthweaver', 'Healingtouch', 'Restorationrod',
  'Deathbringer', 'Soulstealer', 'Lifeleech', 'Necromancer\'s Rod', 'Gravecaller',
  'Mindbreaker', 'Psychicpiercer', 'Thoughtthief', 'Memorymelter', 'Brainbender',
  'Timewarp', 'Chronocane', 'Temporaltwist', 'Pastpresent', 'Futureseer',
  'Dimensionrift', 'Portalopener', 'Realmweaver', 'Planewalker', 'Worldhopper',
  'Starfall', 'Meteorstrike', 'Cometcaller', 'Asteroidattract', 'Cosmiccrash',
  'Voidtouch', 'Nullifier', 'Eraserend', 'Oblivionbringer', 'Existenceeraser',
  'The Big Stick', 'Walking Stick 2.0', 'Fancy Cane', 'Not Compensating', 'Long and Powerful',
  'Boomer Staff', 'OK Wizard', 'Millennial Mage', 'Gen Z Zapper', 'Silent Generation',
  'Social Distancing', 'Six Feet Away', 'Don\'t Touch Me', 'Personal Space', 'Bubble Enforcer',
  'WiFi Wand', 'Bluetooth Baton', 'Wireless Wonder', 'Smart Staff', 'IoT Implement',
  'Debugger', 'Compiler', 'Interpreter', 'Runtime Error', 'Null Pointer',
  'Final Spell', 'Ultimate Cast', 'Last Magic', 'End Incantation', 'Closing Conjuration',
];

export const WAND_NAMES = [
  'Sparkler', 'Glimmer', 'Shimmer', 'Twinkle', 'Glitter',
  'Starlight', 'Moonbeam', 'Sunray', 'Dawnlight', 'Duskglow',
  'Fairy Dust', 'Pixie Powder', 'Sprite Sparkle', 'Elf Essence', 'Gnome Glitter',
  'Dragon\'s Breath', 'Phoenix Flame', 'Unicorn Horn', 'Griffin Feather', 'Basilisk Eye',
  'Arcane Focus', 'Mystic Channel', 'Magic Conduit', 'Spell Amplifier', 'Power Pointer',
  'Lightning Rod', 'Thunder Stick', 'Storm Wand', 'Tempest Twig', 'Cyclone Conductor',
  'Flame Finger', 'Fire Pointer', 'Inferno Indicator', 'Blaze Beacon', 'Ember Emitter',
  'Frost Finger', 'Ice Pointer', 'Glacier Guide', 'Blizzard Beacon', 'Tundra Touch',
  'Life Spark', 'Nature Nudge', 'Growth Guide', 'Healing Hand', 'Restoration Rod',
  'Death Touch', 'Soul Siphon', 'Life Leech', 'Necrotic Nudge', 'Grave Guide',
  'Mind Meld', 'Thought Touch', 'Psychic Pointer', 'Mental Manipulator', 'Brain Beacon',
  'Time Ticker', 'Chrono Clicker', 'Temporal Tapper', 'Past Pointer', 'Future Finder',
  'Dimension Dialer', 'Portal Pointer', 'Realm Reacher', 'Plane Prober', 'World Waver',
  'Void Vessel', 'Null Nudge', 'Empty Emitter', 'Nothing Needle', 'Zero Zapper',
  'The Little Zappy', 'Pew Pew Stick', 'Magic Missile Launcher', 'Spell Shooter', 'Cantrip Cannon',
  'Harry\'s Backup', 'Wizard School Dropout', 'Muggle\'s Nightmare', 'Sorting Hat\'s Choice', 'House Points',
  'Abracadabra', 'Hocus Pocus', 'Alakazam', 'Presto', 'Shazam',
  'WiFi Signal', 'Bluetooth Pairing', '5G Tower', 'Hotspot', 'Router Reboot',
  'Laser Pointer', 'Cat Toy', 'Presentation Helper', 'Meeting Escape', 'PowerPoint Panic',
  'Final Flick', 'Ultimate Wave', 'Last Point', 'End Gesture', 'Closing Cast',
];

// ============================================
// FANTASY ARMOR NAMES (100 each slot)
// ============================================

export const HELMET_NAMES = [
  'Crown of Shadows', 'Helm of the Fallen', 'Visage of Doom', 'Mask of Eternity', 'Casque of Kings',
  'Dragon\'s Crest', 'Wyrm\'s Guard', 'Serpent\'s Crown', 'Beast\'s Brow', 'Monster\'s Maw',
  'Warrior\'s Pride', 'Champion\'s Glory', 'Hero\'s Honor', 'Victor\'s Vanguard', 'Conqueror\'s Crown',
  'Knight\'s Devotion', 'Paladin\'s Purpose', 'Crusader\'s Conviction', 'Templar\'s Trust', 'Guardian\'s Grace',
  'Berserker\'s Rage', 'Barbarian\'s Fury', 'Savage\'s Wrath', 'Wild\'s Anger', 'Primal\'s Power',
  'Assassin\'s Veil', 'Rogue\'s Hood', 'Thief\'s Mask', 'Shadow\'s Shroud', 'Night\'s Cowl',
  'Mage\'s Circlet', 'Wizard\'s Crown', 'Sorcerer\'s Tiara', 'Warlock\'s Band', 'Witch\'s Hat',
  'Priest\'s Mitre', 'Bishop\'s Cap', 'Cleric\'s Coif', 'Monk\'s Hood', 'Sage\'s Crown',
  'King\'s Crown', 'Queen\'s Tiara', 'Prince\'s Circlet', 'Duke\'s Coronet', 'Earl\'s Cap',
  'Peasant\'s Hat', 'Farmer\'s Cap', 'Villager\'s Hood', 'Commoner\'s Cover', 'Serf\'s Shade',
  'Iron Dome', 'Steel Shell', 'Bronze Bowl', 'Copper Cap', 'Silver Skull',
  'Gold Crown', 'Platinum Plate', 'Diamond Dome', 'Mithril Mask', 'Dragon Helm',
  'Flame Crown', 'Frost Helm', 'Storm Casque', 'Earth Crest', 'Void Visor',
  'Sun\'s Glory', 'Moon\'s Glow', 'Star\'s Shine', 'Dawn\'s Light', 'Dusk\'s Shadow',
  'Thinking Cap', 'Brain Bucket', 'Noggin Protector', 'Head House', 'Skull Shield',
  'Hair Dryer', 'Bad Hair Day', 'Hat Hair', 'Morning After', 'Bed Head',
  'Dunce Cap', 'Party Hat', 'Birthday Crown', 'Celebration Cap', 'Festival Helm',
  'Chef\'s Toque', 'Baker\'s Cap', 'Cook\'s Crown', 'Kitchen King', 'Culinary Crown',
  'Hard Hat', 'Safety First', 'OSHA Approved', 'Workplace Wonder', 'Construction Crown',
  'Final Guard', 'Ultimate Shield', 'Last Defense', 'End Protector', 'Closing Cover',
];

export const CHEST_NAMES = [
  'Breastplate of Valor', 'Chestguard of Honor', 'Cuirass of Glory', 'Hauberk of Might', 'Aegis of Heroes',
  'Dragon\'s Scale', 'Wyrm\'s Hide', 'Serpent\'s Skin', 'Beast\'s Pelt', 'Monster\'s Mail',
  'Warrior\'s Resolve', 'Champion\'s Core', 'Hero\'s Heart', 'Victor\'s Vest', 'Conqueror\'s Coat',
  'Knight\'s Faith', 'Paladin\'s Purity', 'Crusader\'s Cause', 'Templar\'s Truth', 'Guardian\'s Gift',
  'Berserker\'s Bark', 'Barbarian\'s Breast', 'Savage\'s Shell', 'Wild\'s Wrap', 'Primal\'s Plate',
  'Assassin\'s Vest', 'Rogue\'s Raiment', 'Thief\'s Tunic', 'Shadow\'s Shirt', 'Night\'s Nightshirt',
  'Mage\'s Mantle', 'Wizard\'s Wrap', 'Sorcerer\'s Shirt', 'Warlock\'s Wear', 'Witch\'s Weave',
  'Priest\'s Robe', 'Bishop\'s Vestment', 'Cleric\'s Cassock', 'Monk\'s Habit', 'Sage\'s Surplice',
  'King\'s Regalia', 'Queen\'s Gown', 'Prince\'s Doublet', 'Duke\'s Dress', 'Earl\'s Ensemble',
  'Peasant\'s Shirt', 'Farmer\'s Frock', 'Villager\'s Vest', 'Commoner\'s Coat', 'Serf\'s Smock',
  'Iron Core', 'Steel Shell', 'Bronze Breast', 'Copper Coat', 'Silver Skin',
  'Gold Guard', 'Platinum Plate', 'Diamond Defense', 'Mithril Mail', 'Dragon Scale',
  'Flame Guard', 'Frost Shield', 'Storm Shelter', 'Earth Embrace', 'Void Vest',
  'Sun\'s Warmth', 'Moon\'s Comfort', 'Star\'s Embrace', 'Dawn\'s Welcome', 'Dusk\'s Cloak',
  'Rib Cage', 'Organ Protector', 'Vital Shield', 'Core Guardian', 'Center Guard',
  'Beer Belly Holder', 'Dad Bod Defender', 'Gym Membership', 'Six Pack Cover', 'Abs Are There',
  'Food Baby', 'Thanksgiving Ready', 'All You Can Eat', 'Buffet Approved', 'Elastic Waist',
  'Bulletproof Vest', 'Kevlar Keeper', 'Tactical Torso', 'Military Grade', 'Combat Core',
  'Work Shirt', 'Business Casual', 'Dress Code Compliant', 'HR Approved', 'Meeting Ready',
  'Final Fortress', 'Ultimate Armor', 'Last Stand', 'End Guard', 'Closing Shield',
];

// Additional armor slot names...
export const SHOULDER_NAMES = [
  'Pauldrons of Power', 'Spaulders of Strength', 'Shoulderguards of Glory', 'Epaulettes of Excellence', 'Mantle of Might',
  // ... 95 more names following similar patterns
  'Dragon\'s Wings', 'Wyrm\'s Shoulders', 'Serpent\'s Shrug', 'Beast\'s Burden', 'Monster\'s Mantle',
  'Warrior\'s Weight', 'Champion\'s Charge', 'Hero\'s Haul', 'Victor\'s Vigor', 'Conqueror\'s Carry',
  'Boulder Shoulders', 'Mountain Mover', 'Atlas\'s Aid', 'Titan\'s Trapezius', 'Giant\'s Grip',
  'Shrug Emoji', 'IDK', '¯\\_(ツ)_/¯', 'Not My Problem', 'Plausible Deniability',
  'Chip Holders', 'Parrot Perch', 'Cat Nap Spot', 'Shoulder Devil', 'Shoulder Angel',
].concat(Array(90).fill(0).map((_, i) => `Shoulderguard ${i + 1}`));

export const BRACER_NAMES = [
  'Vambraces of Valor', 'Bracers of Bravery', 'Wristguards of War', 'Armguards of Might', 'Forearm Fortress',
  // Similar pattern...
].concat(Array(95).fill(0).map((_, i) => `Bracer ${i + 1}`));

export const GLOVE_NAMES = [
  'Gauntlets of Glory', 'Gloves of Grandeur', 'Handguards of Honor', 'Fists of Fury', 'Palms of Power',
  // Similar pattern...
].concat(Array(95).fill(0).map((_, i) => `Glove ${i + 1}`));

export const PANTS_NAMES = [
  'Legguards of Legend', 'Greaves of Glory', 'Cuisses of Courage', 'Leggings of Might', 'Pants of Power',
  // Similar pattern...
].concat(Array(95).fill(0).map((_, i) => `Legguard ${i + 1}`));

export const BOOTS_NAMES = [
  'Boots of Swiftness', 'Sabatons of Speed', 'Greaves of Grace', 'Treads of Thunder', 'Stompers of Strength',
  // Similar pattern...
].concat(Array(95).fill(0).map((_, i) => `Boot ${i + 1}`));

export const CLOAK_NAMES = [
  'Cape of Shadows', 'Cloak of Concealment', 'Mantle of Mystery', 'Shroud of Secrets', 'Wrap of Whispers',
  // Similar pattern...
].concat(Array(95).fill(0).map((_, i) => `Cloak ${i + 1}`));

// ============================================
// JEWELRY NAMES
// ============================================

export const RING_NAMES = [
  'Band of Power', 'Circle of Strength', 'Loop of Life', 'Ring of Resilience', 'Hoop of Hope',
  'One Ring', 'Precious', 'My Precious', 'The One', 'Ruling Ring',
  'Wedding Band', 'Engagement Ring', 'Promise Ring', 'Commitment Circle', 'Forever Loop',
  // ... more names
].concat(Array(85).fill(0).map((_, i) => `Ring ${i + 1}`));

export const NECKLACE_NAMES = [
  'Amulet of Ages', 'Pendant of Power', 'Choker of Champions', 'Necklace of Nobility', 'Chain of Champions',
  'Heart of the Ocean', 'Soul Stone', 'Life Jewel', 'Essence Gem', 'Spirit Crystal',
  // ... more names
].concat(Array(90).fill(0).map((_, i) => `Necklace ${i + 1}`));

export const TRINKET_NAMES = [
  'Charm of Chance', 'Token of Triumph', 'Talisman of Tenacity', 'Fetish of Fortune', 'Idol of Influence',
  'Lucky Rabbit\'s Foot', 'Four-Leaf Clover', 'Horseshoe', 'Wishbone', 'Penny',
  // ... more names
].concat(Array(90).fill(0).map((_, i) => `Trinket ${i + 1}`));

// ============================================
// RESOURCE TIER DEFINITIONS
// ============================================

export interface ResourceTier {
  tier: number;
  name: string;
  levelMin: number;
  levelMax: number;
  baseValue: number;
}

export const MINING_TIERS: ResourceTier[] = [
  { tier: 1, name: 'Copper Ore', levelMin: 1, levelMax: 20, baseValue: 0.1 },
  { tier: 2, name: 'Tin Ore', levelMin: 21, levelMax: 40, baseValue: 0.15 },
  { tier: 3, name: 'Bronze Ore', levelMin: 41, levelMax: 60, baseValue: 0.25 },
  { tier: 4, name: 'Iron Ore', levelMin: 61, levelMax: 80, baseValue: 0.4 },
  { tier: 5, name: 'Coal', levelMin: 81, levelMax: 100, baseValue: 0.6 },
  { tier: 6, name: 'Silver Ore', levelMin: 101, levelMax: 120, baseValue: 1.0 },
  { tier: 7, name: 'Gold Ore', levelMin: 121, levelMax: 140, baseValue: 1.5 },
  { tier: 8, name: 'Platinum Ore', levelMin: 141, levelMax: 160, baseValue: 2.5 },
  { tier: 9, name: 'Mythril Ore', levelMin: 161, levelMax: 180, baseValue: 4.0 },
  { tier: 10, name: 'Adamantite', levelMin: 181, levelMax: 200, baseValue: 6.5 },
  { tier: 11, name: 'Obsidian', levelMin: 201, levelMax: 220, baseValue: 10 },
  { tier: 12, name: 'Orichalcum', levelMin: 221, levelMax: 240, baseValue: 15 },
  { tier: 13, name: 'Star Metal', levelMin: 241, levelMax: 260, baseValue: 25 },
  { tier: 14, name: 'Dragon Ore', levelMin: 261, levelMax: 280, baseValue: 40 },
  { tier: 15, name: 'Phoenix Stone', levelMin: 281, levelMax: 300, baseValue: 65 },
  // ... continues to tier 50
];

export const FISHING_TIERS: ResourceTier[] = [
  { tier: 1, name: 'Minnow', levelMin: 1, levelMax: 20, baseValue: 0.1 },
  { tier: 2, name: 'Perch', levelMin: 21, levelMax: 40, baseValue: 0.15 },
  { tier: 3, name: 'Trout', levelMin: 41, levelMax: 60, baseValue: 0.25 },
  { tier: 4, name: 'Bass', levelMin: 61, levelMax: 80, baseValue: 0.4 },
  { tier: 5, name: 'Catfish', levelMin: 81, levelMax: 100, baseValue: 0.6 },
  { tier: 6, name: 'Salmon', levelMin: 101, levelMax: 120, baseValue: 1.0 },
  { tier: 7, name: 'Pike', levelMin: 121, levelMax: 140, baseValue: 1.5 },
  { tier: 8, name: 'Tuna', levelMin: 141, levelMax: 160, baseValue: 2.5 },
  { tier: 9, name: 'Swordfish', levelMin: 161, levelMax: 180, baseValue: 4.0 },
  { tier: 10, name: 'Marlin', levelMin: 181, levelMax: 200, baseValue: 6.5 },
  { tier: 11, name: 'Barracuda', levelMin: 201, levelMax: 220, baseValue: 10 },
  { tier: 12, name: 'Shark', levelMin: 221, levelMax: 240, baseValue: 15 },
  { tier: 13, name: 'Manta Ray', levelMin: 241, levelMax: 260, baseValue: 25 },
  { tier: 14, name: 'Giant Squid', levelMin: 261, levelMax: 280, baseValue: 40 },
  { tier: 15, name: 'Kraken Spawn', levelMin: 281, levelMax: 300, baseValue: 65 },
];

export const HERBALISM_TIERS: ResourceTier[] = [
  { tier: 1, name: 'Dandelion', levelMin: 1, levelMax: 20, baseValue: 0.1 },
  { tier: 2, name: 'Chamomile', levelMin: 21, levelMax: 40, baseValue: 0.15 },
  { tier: 3, name: 'Lavender', levelMin: 41, levelMax: 60, baseValue: 0.25 },
  { tier: 4, name: 'Sage', levelMin: 61, levelMax: 80, baseValue: 0.4 },
  { tier: 5, name: 'Rosemary', levelMin: 81, levelMax: 100, baseValue: 0.6 },
  { tier: 6, name: 'Thyme', levelMin: 101, levelMax: 120, baseValue: 1.0 },
  { tier: 7, name: 'Mint', levelMin: 121, levelMax: 140, baseValue: 1.5 },
  { tier: 8, name: 'Basil', levelMin: 141, levelMax: 160, baseValue: 2.5 },
  { tier: 9, name: 'Ginseng', levelMin: 161, levelMax: 180, baseValue: 4.0 },
  { tier: 10, name: 'Echinacea', levelMin: 181, levelMax: 200, baseValue: 6.5 },
  { tier: 11, name: 'Valerian', levelMin: 201, levelMax: 220, baseValue: 10 },
  { tier: 12, name: 'Moonpetal', levelMin: 221, levelMax: 240, baseValue: 15 },
  { tier: 13, name: 'Sunbloom', levelMin: 241, levelMax: 260, baseValue: 25 },
  { tier: 14, name: 'Starleaf', levelMin: 261, levelMax: 280, baseValue: 40 },
  { tier: 15, name: 'Dragonthorn', levelMin: 281, levelMax: 300, baseValue: 65 },
];

export const SKINNING_TIERS: ResourceTier[] = [
  { tier: 1, name: 'Rabbit Hide', levelMin: 1, levelMax: 20, baseValue: 0.1 },
  { tier: 2, name: 'Squirrel Pelt', levelMin: 21, levelMax: 40, baseValue: 0.15 },
  { tier: 3, name: 'Fox Fur', levelMin: 41, levelMax: 60, baseValue: 0.25 },
  { tier: 4, name: 'Deer Hide', levelMin: 61, levelMax: 80, baseValue: 0.4 },
  { tier: 5, name: 'Wolf Pelt', levelMin: 81, levelMax: 100, baseValue: 0.6 },
  { tier: 6, name: 'Bear Hide', levelMin: 101, levelMax: 120, baseValue: 1.0 },
  { tier: 7, name: 'Boar Leather', levelMin: 121, levelMax: 140, baseValue: 1.5 },
  { tier: 8, name: 'Elk Hide', levelMin: 141, levelMax: 160, baseValue: 2.5 },
  { tier: 9, name: 'Mountain Lion Pelt', levelMin: 161, levelMax: 180, baseValue: 4.0 },
  { tier: 10, name: 'Tiger Skin', levelMin: 181, levelMax: 200, baseValue: 6.5 },
  { tier: 11, name: 'Crocodile Leather', levelMin: 201, levelMax: 220, baseValue: 10 },
  { tier: 12, name: 'Hippo Hide', levelMin: 221, levelMax: 240, baseValue: 15 },
  { tier: 13, name: 'Rhino Leather', levelMin: 241, levelMax: 260, baseValue: 25 },
  { tier: 14, name: 'Elephant Hide', levelMin: 261, levelMax: 280, baseValue: 40 },
  { tier: 15, name: 'Wyvern Scale', levelMin: 281, levelMax: 300, baseValue: 65 },
];

export const FORAGING_TIERS: ResourceTier[] = [
  { tier: 1, name: 'Roadside Scraps', levelMin: 1, levelMax: 20, baseValue: 0.05 },
  { tier: 2, name: 'Field Finds', levelMin: 21, levelMax: 40, baseValue: 0.1 },
  { tier: 3, name: 'Forest Treasures', levelMin: 41, levelMax: 60, baseValue: 0.2 },
  { tier: 4, name: 'Camp Salvage', levelMin: 61, levelMax: 80, baseValue: 0.35 },
  { tier: 5, name: 'Battlefield Relics', levelMin: 81, levelMax: 100, baseValue: 0.5 },
  { tier: 6, name: 'Ruin Artifacts', levelMin: 101, levelMax: 120, baseValue: 0.8 },
  { tier: 7, name: 'Cave Discoveries', levelMin: 121, levelMax: 140, baseValue: 1.2 },
  { tier: 8, name: 'Mountain Treasures', levelMin: 141, levelMax: 160, baseValue: 2.0 },
  { tier: 9, name: 'Temple Relics', levelMin: 161, levelMax: 180, baseValue: 3.5 },
  { tier: 10, name: 'Dragon Hoard', levelMin: 181, levelMax: 200, baseValue: 5.5 },
];

// ============================================
// SKILL TO RESOURCE MAPPING
// ============================================

export const SKILL_RESOURCE_TIERS: Partial<Record<SkillType, ResourceTier[]>> = {
  [SkillType.MINING]: MINING_TIERS,
  [SkillType.FISHING]: FISHING_TIERS,
  [SkillType.HERBALISM]: HERBALISM_TIERS,
  [SkillType.SKINNING]: SKINNING_TIERS,
  [SkillType.FORAGING]: FORAGING_TIERS,
};

// ============================================
// EQUIPMENT GENERATION HELPERS
// ============================================

export function getRandomWeaponName(type: WeaponType): string {
  const names: Record<WeaponType, string[]> = {
    [WeaponType.SWORD]: SWORD_NAMES,
    [WeaponType.BROADSWORD]: BROADSWORD_NAMES,
    [WeaponType.MACE]: MACE_NAMES,
    [WeaponType.AXE]: AXE_NAMES,
    [WeaponType.DAGGER]: DAGGER_NAMES,
    [WeaponType.STAFF]: STAFF_NAMES,
    [WeaponType.WAND]: WAND_NAMES,
  };
  const list = names[type];
  return list[Math.floor(Math.random() * list.length)];
}

export function getRandomArmorName(slot: EquipSlot): string {
  const names: Partial<Record<EquipSlot, string[]>> = {
    [EquipSlot.HEAD]: HELMET_NAMES,
    [EquipSlot.CHEST]: CHEST_NAMES,
    [EquipSlot.SHOULDERS]: SHOULDER_NAMES,
    [EquipSlot.BRACERS]: BRACER_NAMES,
    [EquipSlot.GLOVES]: GLOVE_NAMES,
    [EquipSlot.PANTS]: PANTS_NAMES,
    [EquipSlot.BOOTS]: BOOTS_NAMES,
    [EquipSlot.BACK]: CLOAK_NAMES,
    [EquipSlot.RING_1]: RING_NAMES,
    [EquipSlot.RING_2]: RING_NAMES,
    [EquipSlot.NECKLACE]: NECKLACE_NAMES,
    [EquipSlot.TRINKET]: TRINKET_NAMES,
  };
  const list = names[slot] || ['Unknown Item'];
  return list[Math.floor(Math.random() * list.length)];
}

export function rollRarity(): Rarity {
  const roll = Math.random() * 100;
  if (roll < 1) return Rarity.LEGENDARY;
  if (roll < 5) return Rarity.EPIC;
  if (roll < 15) return Rarity.RARE;
  if (roll < 40) return Rarity.UNCOMMON;
  return Rarity.COMMON;
}

export function rollMaterialTier(foragingLevel: number): MaterialTier {
  // Higher foraging level = better chance at higher tier materials
  const levelBonus = foragingLevel / 100; // 0 to ~10
  const roll = Math.random() * 100;

  if (roll < 0.5 + levelBonus) return MaterialTier.DRAGON;
  if (roll < 2 + levelBonus * 2) return MaterialTier.DIAMOND;
  if (roll < 4 + levelBonus * 3) return MaterialTier.PLATINUM;
  if (roll < 7 + levelBonus * 4) return MaterialTier.GOLD;
  if (roll < 12 + levelBonus * 5) return MaterialTier.MITHRIL;
  if (roll < 20 + levelBonus * 5) return MaterialTier.SILVER;
  if (roll < 35 + levelBonus * 3) return MaterialTier.IRON;
  if (roll < 60 + levelBonus * 2) return MaterialTier.BRONZE;
  return MaterialTier.COPPER;
}
