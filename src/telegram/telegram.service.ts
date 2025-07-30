import { Injectable, OnModuleInit } from '@nestjs/common';
import { ServicesService } from 'src/services/services.service';
import { Markup, Telegraf } from 'telegraf';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;
  private ADMIN_CHANNEL_ID = process.env.ADMIN_CHANNEL_ID || '-1001234567890';
  private userSelections = new Map<number, { category?: string; service?: string; phone?: string; name?: string; role?: string }>();

  constructor(private readonly services: ServicesService) {
    this.bot = new Telegraf(process.env.BOT_TOKEN || '');
  }

  async onModuleInit() {
    const serviceList = await this.services.getAllServices();

    /** START komandasi */
    const mainMenu = Markup.inlineKeyboard([
      [Markup.button.callback('🔧 Menga usta kerak', 'user')],
      [Markup.button.callback("🛠 Men xizmat ko‘rsatmoqchiman", 'master')],
      [Markup.button.callback('ℹ️ Bot haqida batafsil', 'info')],
    ]);

    this.bot.start((ctx) => {
      ctx.reply(
        `Assalomu alaykum! 👋
"Ustabor" xizmat ko‘rsatish platformasiga xush kelibsiz!

✅ Bu yerda siz:
— Ishonchli ustalarni topishingiz,
— Yoki xizmat ko‘rsatib daromad topishingiz mumkin.

Quyidagilardan birini tanlang:`,
        mainMenu
      );
    });

    /** Mijoz tugmasi bosilganda — kategoriyalar chiqadi */
    this.bot.action('user', async (ctx) => {
      const categories = Object.keys(serviceList);
      await ctx.editMessageText(
        'Qaysi turdagi xizmat kerak?',
        Markup.inlineKeyboard([
          ...categories.map((category) => [Markup.button.callback(category, `category_${category}`)]),
          [Markup.button.callback('◀️ Orqaga', 'back_main')],
        ])
      );
    });

    /** Har bir kategoriya uchun xizmatlar chiqishi */
    Object.keys(serviceList).forEach((category) => {
      this.bot.action(`category_${category}`, async (ctx) => {
        const services = serviceList[category];
        await ctx.editMessageText(
          `Tanlangan kategoriya: ${category}\nXizmatni tanlang:\n\n📞 Admin: @ustabor_admin \n\n📞Tel: +998887910708`,
          Markup.inlineKeyboard([
            ...services.map((service) => [Markup.button.callback(service, `service_${service}`)]),
            [Markup.button.callback('◀️ Orqaga', 'user')],
          ])
        );
      });
    });

    /** Xizmat tanlanganda telefon raqamini so‘rash */
    Object.entries(serviceList).forEach(([category, services]) => {
      services.forEach((service) => {
        this.bot.action(`service_${service}`, async (ctx) => {
          const userId = ctx.from.id;
          this.userSelections.set(userId, { category, service, role: 'client' });

          await ctx.reply(
            `✅ Siz "${service}" xizmatini tanladingiz.\n\n📱 Iltimos, telefon raqamingizni ulashing:`,
            Markup.keyboard([
                [Markup.button.contactRequest('📞 Telefon raqamni ulashish')],
                [Markup.button.text('❌ Bekor qilish')],
              ])
              .oneTime()
              .resize()
          );
        });
      });
    });

    /** Telefon raqamini olish (mijoz uchun) */
    this.bot.on('contact', async (ctx) => {
      const userId = ctx.from.id;
      const selection = this.userSelections.get(userId);
      if (!selection) return;

      selection.phone = ctx.message.contact.phone_number;

      if (selection.role === 'client') {
        await ctx.reply(
          `✅ Ma’lumotlaringiz:\n\n` +
            `📌 Kategoriya: ${selection.category}\n` +
            `🔧 Xizmat: ${selection.service}\n` +
            `📱 Telefon: ${selection.phone}\n\n` +
            `Tasdiqlaysizmi?`,
          Markup.inlineKeyboard([
            [Markup.button.callback('✅ Ha, tasdiqlayman', 'confirm')],
            [Markup.button.callback('❌ Bekor qilish', 'cancel')],
          ])
        );
      }

      if (selection.role === 'master') {
        await ctx.reply(
          `✅ Ma’lumotlaringiz:\n\n` +
            `👤 Ism: ${selection.name}\n` +
            `📌 Yo‘nalish: ${selection.service}\n` +
            `📱 Telefon: ${selection.phone}\n\n` +
            `Tasdiqlaysizmi?`,
          Markup.inlineKeyboard([
            [Markup.button.callback('✅ Ha, tasdiqlayman', 'confirm')],
            [Markup.button.callback('❌ Bekor qilish', 'cancel')],
          ])
        );
      }
    });

    /** Tasdiqlash tugmasi */
    this.bot.action('confirm', async (ctx) => {
      const userId = ctx.from.id;
      const selection = this.userSelections.get(userId);
      if (!selection) return;

      const user = ctx.from;
      let message = '';

      if (selection.role === 'client') {
        message = `
🆕 Yangi BUYURTMA!

📌 Kategoriya: ${selection.category}
🔧 Xizmat: ${selection.service}
📱 Telefon: ${selection.phone}

👤 Foydalanuvchi: ${user.first_name || ''} ${user.last_name || ''}
Username: @${user.username || 'yo‘q'}
ID: ${user.id}
        `;
      } else if (selection.role === 'master') {
        message = `
🆕 Yangi USTA ARIZASI!

👤 Ism: ${selection.name}
📌 Yo‘nalish: ${selection.service}
📱 Telefon: ${selection.phone}

Username: @${user.username || 'yo‘q'}
ID: ${user.id}
        `;
      }

      try {
        await ctx.reply('✅ Ma’lumotlaringiz qabul qilindi! Admin tez orada bog‘lanadi.');
        await this.bot.telegram.sendMessage(this.ADMIN_CHANNEL_ID, message);
        this.userSelections.delete(userId);
      } catch (error) {
        console.error('❌ Kanalga yuborishda xato:', error);
      }
    });

    /** Bekor qilish tugmasi */
    this.bot.action('cancel', async (ctx) => {
      const userId = ctx.from.id;
      this.userSelections.delete(userId);
      await ctx.reply('❌ Amal bekor qilindi.', mainMenu);
    });

    /** Orqaga tugmasi */
    this.bot.action('back_main', async (ctx) => {
      await ctx.editMessageText('Asosiy menyu:', mainMenu);
    });

    /** Usta bo‘lish tugmasi */
    this.bot.action('master', async (ctx) => {
      const userId = ctx.from.id;
      this.userSelections.set(userId, { role: 'master' });

      await ctx.reply(`Ismingizni yuboring:`);
    });

    /** Usta ismini va yo‘nalishini ketma-ket so‘rash */
    this.bot.on('text', async (ctx) => {
      const userId = ctx.from.id;
      const selection = this.userSelections.get(userId);
      if (!selection) return;

      if (selection.role === 'master') {
        if (!selection.name) {
          selection.name = ctx.message.text;
          await ctx.reply(`Yo‘nalishingizni kiriting (masalan: santexnik, elektrik):`);
          return;
        }
        if (!selection.service) {
          selection.service = ctx.message.text;
          await ctx.reply(
            `📱 Endi telefon raqamingizni ulashing:`,
            Markup.keyboard([Markup.button.contactRequest('📞 Telefon raqamni ulashish')])
              .oneTime()
              .resize()
          );
        }
      }
    });

    /** Bot haqida */
    this.bot.action('info', (ctx) =>
      ctx.reply(
        `ℹ️ "Ustabor" nima?

✅ Ustabor – bu ishonchli ustalar va mijozlarni bog‘laydigan platforma.
Bu yerda siz:
— O‘zingiz uchun eng yaxshi usta topasiz.
— O‘zingizning xizmatlaringizni taklif qilib daromad olasiz.

🔐 Xavfsizlik:
— Har bir usta admin tomonidan tasdiqlanadi.
— Sizning ma'lumotlaringiz himoyalangan.

🚀 Maqsadimiz: xizmatlarni tez, oson va ishonchli qilib ulash!

ADMIN @ustabor_admin
ALOQA UCHUN +998887910708 +998916677141
DASTURCHI @azez_coder
`
      )
    );

    /** Botni ishga tushirish */
    await this.bot.launch();
    console.log('✅ Bot ishga tushdi');
  }
}
