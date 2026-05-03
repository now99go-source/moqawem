import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PerformanceBadge from "../components/PerformanceBadge";
import AddEvidenceInline from "../components/AddEvidenceInline";
import { REQUIRED_DOCS } from "../utils/requiredDocuments";
import { BookOpen, ChevronDown, ChevronLeft, Plus, Edit2, Save, X, PaperclipIcon } from "lucide-react";

// Built-in standards data based on ETEC framework
const ETEC_STRUCTURE = [
  {
    domain: "الإدارة المدرسية", code: "1", color: "purple",
    standards: [
      { name: "التخطيط", code: "1-1", indicators: [
        { code: "1-1-1-1", desc: "تضع المدرسة خطة تشغيلية مكتملة العناصر، وفق أهداف تطويرية محددة.",
          tamayuz: "تضع المدرسة خطة تشغيلية مرنة مكتملة العناصر تتضمن خططاً للاستدامة والتحسين، ومبادرات نوعية لتحقيق أهداف تطويرية طموحة، وتشارك في إعدادها أكثر من 90% من أعضاء الكادر التعليمي.",
          tools: ["أداة تحليل الوثائق", "استبانة المعلم", "أداة المقابلات"] },
        { code: "1-1-1-2", desc: "تتابع المدرسة تنفيذ خطتها وتطورها بما يضمن تحقيق أهدافها.",
          tamayuz: "تتابع المدرسة - دائماً - تنفيذ الأنشطة والبرامج وفق الخطة الزمنية، وتقومها بأساليب متنوعة وتطورها لتحقيق أهدافها.",
          tools: ["أداة تحليل الوثائق", "استبانة المعلم", "أداة المقابلات"] },
      ]},
      { name: "قيادة العملية التعليمية", code: "1-2", indicators: [
        { code: "1-2-1-1", desc: "تعزز المدرسة القيم الإسلامية والهوية الوطنية.",
          tamayuz: "تستهدف المدرسة تعزيز القيم الإسلامية والهوية الوطنية بصورة واضحة في خططها، وتستثمر المناسبات - دائماً - لتعزيزها في الأنشطة الصفية وغير الصفية والبرامج المدرسية والمجتمع المحلي، وتُعرّف بتنفيذها بأساليب متنوعة ومبتكرة.",
          tools: ["أداة تحليل الوثائق", "استبانة ولي الأمر", "استبانة المتعلم", "أداة المقابلات"] },
        { code: "1-2-1-2", desc: "تلتزم المدرسة بقيم مهنة التعليم وأخلاقياتها.",
          tamayuz: "تُظهر إدارة المدرسة التزاماً متميزاً بقواعد السلوك الوظيفي وأخلاقيات مهنة التعليم، ويسود المدرسة علاقات إيجابية قائمة على الاحترام المتبادل والثقة والتوازن بين العلاقات الإنسانية والواجبات الوظيفية بدرجة متميزة (90% فأكثر).",
          tools: ["أداة تحليل الوثائق", "استبانة المعلم", "أداة المقابلات"] },
        { code: "1-2-1-3", desc: "توفر المدرسة مناخاً آمناً للتعلم والنمو نفسياً واجتماعياً.",
          tamayuz: "يسود التعاون والعلاقات الإيجابية بين المتعلمين بدرجة متميزة وتكاد تختفي حالات التنمر، وتوفر المدرسة - دائماً - برامج وأنشطة وقائية لتوفير مناخ آمن يشجع المناقشة والحوار وتقبل الرأي الآخر، ويدعم التعلم والنمو الشامل لشخصية المتعلمين.",
          tools: ["أداة تحليل الوثائق", "استبانة المتعلم", "استبانة المعلم", "استبانة ولي الأمر", "أداة المقابلات"] },
        { code: "1-2-1-4", desc: "تنشر المدرسة قواعد السلوك والمواظبة، وتتابع تطبيقها.",
          tamayuz: "تنشر المدرسة قواعد السلوك والمواظبة، وتتابع - دائماً - تطبيقها بانتظام في المجتمع المدرسي والمجتمع المحلي وبأساليب متنوعة ومبتكرة.",
          tools: ["أداة تحليل الوثائق", "استبانة المتعلم", "استبانة المعلم", "استبانة ولي الأمر", "أداة المقابلات"] },
        { code: "1-2-1-5", desc: "توفر المدرسة برامج وأنشطة تربوية داعمة للسلوك الإيجابي.",
          tamayuz: "توفر المدرسة - دائماً - أنشطة وبرامج علاجية أو وقائية متنوعة لتعزيز السلوك الإيجابي لدى المتعلمين وترتب بنتائج تشخيص المشكلات السلوكية، وتتابع تطبيقها بأساليب مبتكرة، وتستثمر الشراكات المجتمعية لتعزيزها.",
          tools: ["أداة تحليل الوثائق", "استبانة المتعلم", "استبانة ولي الأمر", "أداة المقابلات"] },
        { code: "1-2-1-6", desc: "توفر المدرسة برامج وأنشطة إثرائية غير صفية لتطوير مواهب المتعلمين.",
          tamayuz: "تطبق المدرسة - دائماً - أساليب للكشف عن مواهب المتعلمين، وتحفزهم على المشاركة في مقاييس موهبة، وتوفر أنشطة إثرائية متنوعة ترتب بنتائج تقويم مواهبهم، وتتابع تطبيقها بأساليب مبتكرة، وتحقق مستويات متقدمة في المسابقات الوطنية والدولية.",
          tools: ["أداة تحليل الوثائق", "استبانة المتعلم", "استبانة ولي الأمر", "استبانة المعلم"] },
      ]},
      { name: "المجتمع المدرسي", code: "1-3", indicators: [
        { code: "1-3-1-1", desc: "تعزز المدرسة بناء العلاقات الإيجابية والتعاون في المجتمع المدرسي.",
          tamayuz: "توفر المدرسة مهام متنوعة تشجع التعاون والعمل بروح الفريق في المجتمع المدرسي والمجتمع المحلي، وتتابع تطبيقها بأساليب متنوعة ومبتكرة، ويسود العلاقات الإيجابية والاحترام المتبادل بين منسوبيها.",
          tools: ["أداة تحليل الوثائق", "استبانة المعلم", "أداة المقابلات"] },
        { code: "1-3-1-2", desc: "تعزز المدرسة مشاركة الأسرة في تعلم أبنائهم والتحضير لمستقبلهم.",
          tamayuz: "توفر المدرسة فرصاً للتواصل مع الأسرة بأساليب فاعلة ومتنوعة، وتقدم - دائماً - أنشطة وبرامج مبتكرة للتوعية بدورهم وتعريفهم بتعلم أبنائهم والتحضير لمستقبلهم، وتقويم خدماتها وتطويرها.",
          tools: ["أداة تحليل الوثائق", "استبانة ولي الأمر", "أداة المقابلات"] },
        { code: "1-3-1-3", desc: "تعزز المدرسة الشراكة المجتمعية لدعم التعلم والتأثير الإيجابي.",
          tamayuz: "توفر المدرسة فرصاً للتواصل مع المجتمع المحلي بطرق متنوعة، ولديها شراكة فاعلة مع المؤسسات الوطنية وتستثمر - دائماً - إمكاناتها لدعم المتعلمين، وتقيم الأنشطة التوعوية للمجتمع المحلي بطرق مبتكرة.",
          tools: ["أداة تحليل الوثائق", "استبانة المعلم", "أداة المقابلات"] },
      ]},
      { name: "التطوير المؤسسي", code: "1-4", indicators: [
        { code: "1-4-1-1", desc: "توفر المدرسة كادراً تعليمياً مكتملاً ومؤهلاً.",
          tamayuz: "نسبة اكتمال الكادر التعليمي المؤهل وتوافق التخصص (بكالوريوس فأعلى في مجال التخصص) 90% فأكثر.",
          tools: ["أداة تحليل الوثائق", "استبانة المعلم", "أداة المقابلات"] },
        { code: "1-4-1-2", desc: "توفر المدرسة كادراً إدارياً مكتملاً ومؤهلاً.",
          tamayuz: "نسبة اكتمال الكادر الإداري المؤهل دبلوم مشارك فأعلى في مجال العمل، 90% فأكثر.",
          tools: ["أداة تحليل الوثائق", "أداة المقابلات"] },
        { code: "1-4-1-3", desc: "تظهر المدرسة ثباتاً واستدامة مالية.",
          tamayuz: "يتوافر لدى المدرسة الموارد المالية الكافية لدعم وتحسين الجودة التعليمية المستمرة، والقدرة على تغطية التزاماتها المالية بدرجة متميزة، وتنشر - دائماً - سياسات الرسوم والتحصيل لأصحاب المصلحة.",
          tools: ["أداة تحليل الوثائق", "أداة المقابلات"] },
        { code: "1-4-1-4", desc: "تشجع المدرسة منسوبيها للحصول على الرخصة المهنية.",
          tamayuz: "توفر المدرسة - دائماً - أنشطة وبرامج توعوية متنوعة للحصول على الرخصة المهنية، ونسبة المعلمين الحاصلين عليها (90% فأكثر) من العدد الإجمالي، وحصول بعضهم على رتبة مستوى متقدم وخبير.",
          tools: ["أداة تحليل الوثائق", "نتائج الرخص المهنية", "استبانة المعلم"] },
        { code: "1-4-1-5", desc: "تدعم المدرسة التطوير المهني لمنسوبيها وفقاً لنتائج تقويم الأداء.",
          tamayuz: "تبني المدرسة - دائماً - خطة للتطوير المهني ترتب بنتائج تقويم الأداء الوظيفي، وتلبي احتياجات جميع منسوبيها، وتقيس أثرها على أدائهم، وتشجعهم على الالتحاق بالبرامج التدريبية، والحاصلون على برامج تدريبية أكثر من 90%.",
          tools: ["أداة تحليل الوثائق", "استبانة المعلم", "أداة المقابلات"] },
        { code: "1-4-1-6", desc: "تطبق المدرسة التقويم الذاتي المبني على المعايير المعتمدة من الهيئة.",
          tamayuz: "تطبق المدرسة جميع إجراءات التقويم الذاتي المبني على المعايير المعتمدة من الهيئة، وتعزز - دائماً - ثقافته بين أعضاء المجتمع المدرسي بطرق وأساليب متنوعة، وتشاركهم نتائجه.",
          tools: ["أداة تحليل الوثائق", "استبانة المعلم"] },
        { code: "1-4-1-7", desc: "تنفذ المدرسة خطة للتحسين بناء على نتائج التقويم المدرسي، وتتابعها.",
          tamayuz: "تنفذ المدرسة جميع عناصر خطة التحسين وتركز على الأولويات وفقاً لنتائج التقويم المدرسي، وتتابعها بانتظام وتطورها.",
          tools: ["أداة تحليل الوثائق", "استبانة المعلم", "أداة المقابلات"] },
      ]},
    ]
  },
  {
    domain: "التعليم والتعلم", code: "2", color: "blue",
    standards: [
      { name: "بناء خبرات التعلم", code: "2-1", indicators: [
        { code: "2-1-1-1", desc: "توفر المدرسة فرصاً متكافئة للتعلم تلبي احتياجات المتعلمين بمن فيهم ذوو الإعاقة والموهوبون.",
          tamayuz: "توفر المدرسة فرصاً متكافئة للتعلم، ومصادر وأنشطة تعلم متنوعة، ويدار الوقت بفاعلية في بيئة التعلم لتلبية احتياجات جميع المتعلمين بمن فيهم ذوو الإعاقة والموهوبون.",
          tools: ["استبانة المتعلم", "أداة الملاحظة الصفية", "أداة المقابلات"] },
        { code: "2-1-1-2", desc: "تدعم المدرسة تنفيذ المناهج لتحقيق نواتج التعلم المستهدفة وفق الخطة الدراسية.",
          tamayuz: "توفر المدرسة أنشطة ومصادر متنوعة لدعم تعلم جميع موضوعات المنهج مع التركيز على المعارف والمهارات النوعية والقيم الوطنية، وتتابع - دائماً - تحقيق نواتج التعلم. ونسبة توافق تنفيذ المنهج مع الخطة الزمنية أكثر من 90%.",
          tools: ["أداة تحليل الوثائق", "استبانة ولي الأمر", "أداة الملاحظة الصفية", "أداة المقابلات"] },
        { code: "2-1-1-3", desc: "تنوع المدرسة في إستراتيجيات التدريس لتلبية احتياجات المتعلمين.",
          tamayuz: "توفر المدرسة إستراتيجيات تدريس تتسم بالسمو والتمايز تلبي احتياجات جميع المتعلمين، وتنوع - دائماً - فيها مراعاة الفروق الفردية لتحقيق نواتج التعلم المستهدفة وفق الخصائص المرحلية العمرية بمن فيهم ذوو الإعاقة والموهوبون.",
          tools: ["استبانة المتعلم", "أداة الملاحظة الصفية", "أداة المقابلات"] },
        { code: "2-1-1-4", desc: "تفعّل المدرسة التعلم الإلكتروني لتلبية احتياجات المتعلمين.",
          tamayuz: "توفر المدرسة أنشطة متنوعة ومبتكرة تدمج بين التعلم الصفي والإلكتروني بدرجة متميزة، وتوفر جميع التجهيزات التقنية اللازمة، وخطة شاملة ومرنة لدمج التعلم الإلكتروني وتتابع - دائماً - تنفيذها وتطويرها.",
          tools: ["استبانة المتعلم", "استبانة ولي الأمر", "أداة الملاحظة الصفية", "أداة المقابلات"] },
        { code: "2-1-1-5", desc: "توفر المدرسة أنشطة تعلم تطبيقية ترتبط بحياة المتعلمين.",
          tamayuz: "توفر المدرسة أنشطة تعلم متنوعة ومبتكرة تركز على التطبيقات العملية الواقعية وترتبط بحياة المتعلمين، وتشجعهم على البحث وإجراء التجارب العملية والاستقصاء بدرجة متميزة.",
          tools: ["استبانة المتعلم", "استبانة ولي الأمر", "أداة الملاحظة الصفية", "أداة المقابلات"] },
        { code: "2-1-1-6", desc: "تنمّي المدرسة المهارات القرائية والعددية الأساسية لدى المتعلمين.",
          tamayuz: "توفر المدرسة أساليب وأنشطة ومصادر تعلم متنوعة ومتميزة تستهدف تنمية مهارات القراءة والكتابة والمهارات العددية لدى جميع المتعلمين، وتدعم مشاركتهم في المسابقات الوطنية والدولية، وتتابع تنفيذها بأساليب مبتكرة.",
          tools: ["أداة تحليل الوثائق", "استبانة المتعلم", "استبانة ولي الأمر", "أداة الملاحظة الصفية", "أداة المقابلات"] },
        { code: "2-1-1-7", desc: "تنمّي المدرسة مهارات التفكير العليا لدى المتعلمين.",
          tamayuz: "توفر المدرسة أساليب وأنشطة تعلم متنوعة ومتميزة تستهدف تنمية مهارات التفكير العليا وتركز على مهارات التحليل والاستنتاج والتقويم والإبداع وحل المشكلات لدى جميع المتعلمين، وتوفر أنشطة إثرائية متنوعة ومبتكرة.",
          tools: ["أداة تحليل الوثائق", "استبانة المتعلم", "استبانة ولي الأمر", "أداة الملاحظة الصفية", "أداة المقابلات"] },
        { code: "2-1-1-8", desc: "تنمّي المدرسة المهارات العاطفية والاجتماعية لدى المتعلمين.",
          tamayuz: "توفر المدرسة أساليب وأنشطة تعلم متنوعة ومتميزة تستهدف تنمية القدرة على التحكم في العواطف وضبط الانفعالات لدى جميع المتعلمين، وتنظم بيئة الصف بما يشجع العمل التعاوني والحوار الفعّال ويسود الاحترام المتبادل بدرجة متميزة.",
          tools: ["استبانة المتعلم", "استبانة ولي الأمر", "أداة الملاحظة الصفية", "أداة المقابلات"] },
        { code: "2-1-1-9", desc: "تنمّي المدرسة المهارات الرقمية لدى المتعلمين.",
          tamayuz: "توفر المدرسة أنشطة متنوعة ومتميزة تشجع جميع المتعلمين على استخدام التقنية الرقمية في التقصي والبحث، وتُهيئ - دائماً - الفرص والمصادر المتنوعة لتنمية المهارات التقنية وإتقانها بمن فيهم ذوو الإعاقة والموهوبون.",
          tools: ["استبانة المتعلم", "استبانة المعلم", "استبانة ولي الأمر", "أداة الملاحظة الصفية"] },
        { code: "2-1-1-10", desc: "تعزز المدرسة دافعية المتعلمين للتعلم والاستمتاع به.",
          tamayuz: "توفر المدرسة أنشطة تعلم متنوعة ومتميزة تشجع الفضول ومحب الاستطلاع لدى جميع المتعلمين، وتطبق - دائماً - أساليب تحفيز تراعي ميولهم واهتماماتهم، وتحقق الرفاه في بيئة التعلم.",
          tools: ["استبانة المتعلم", "استبانة ولي الأمر", "أداة الملاحظة الصفية", "أداة المقابلات"] },
      ]},
      { name: "تقويم التعلم", code: "2-2", indicators: [
        { code: "2-2-1-1", desc: "تقوّم المدرسة أداء المتعلمين باستخدام أساليب وأدوات تقويم متنوعة وفاعلة.",
          tamayuz: "تطبق المدرسة - دائماً - أساليب وأدوات تقويم متنوعة وفاعلة تشخيصية وتكوينية وختامية تدعم التعلم، ويظهر التمايز في مستويات أداء المتعلمين، وتشجعهم على المشاركة في تقويم أدائهم وتحسينه بطرق متنوعة.",
          tools: ["أداة تحليل الوثائق", "استبانة المتعلم", "استبانة ولي الأمر", "أداة الملاحظة الصفية"] },
        { code: "2-2-1-2", desc: "تحلل المدرسة نتائج التقويم وتوظفها في تحسين نواتج التعلم بانتظام.",
          tamayuz: "تحلل المدرسة - دائماً - نتائج التقويم وتفسرها بطرق متنوعة، وتوظفها بناء على خطط علاجية لتحسين نواتج التعلم لدى المتعلمين، وتتابع تنفيذها بانتظام.",
          tools: ["أداة تحليل الوثائق", "استبانة المعلم", "أداة المقابلات"] },
        { code: "2-2-1-3", desc: "تقدم المدرسة التغذية الراجعة للمتعلمين بانتظام.",
          tamayuz: "تقدم المدرسة - دائماً - التغذية الراجعة الفورية للمتعلمين بطرق متنوعة لدعم تعلمهم وتحسين أدائهم بانتظام وتعزز التعلم الذاتي لديهم.",
          tools: ["أداة تحليل الوثائق", "استبانة المتعلم", "استبانة ولي الأمر", "أداة المقابلات"] },
      ]},
    ]
  },
  {
    domain: "نواتج التعلم", code: "3", color: "green",
    standards: [
      { name: "التحصيل التعليمي", code: "3-1", indicators: [
        { code: "3-1-1-1", desc: "يحقق المتعلمون نتائج متقدمة في مجال القراءة وفقاً للاختبارات الوطنية.",
          tamayuz: "يحقق أكثر من 90% من المتعلمين مستويات متقدمة في القراءة وفقاً للاختبارات الوطنية (نافس).",
          tools: ["نتائج الاختبارات الوطنية - نافس"] },
        { code: "3-1-1-2", desc: "يحقق المتعلمون نتائج متقدمة في مجال الرياضيات وفقاً للاختبارات الوطنية.",
          tamayuz: "يحقق أكثر من 90% من المتعلمين مستويات متقدمة في الرياضيات وفقاً للاختبارات الوطنية (نافس).",
          tools: ["نتائج الاختبارات الوطنية - نافس"] },
        { code: "3-1-1-3", desc: "يحقق المتعلمون نتائج متقدمة في مجال العلوم وفقاً للاختبارات الوطنية.",
          tamayuz: "يحقق أكثر من 90% من المتعلمين مستويات متقدمة في العلوم وفقاً للاختبارات الوطنية (نافس).",
          tools: ["نتائج الاختبارات الوطنية - نافس"] },
        { code: "3-1-1-4", desc: "يحقق المتعلمون تقدماً في مجال القراءة قياساً على مستوى أداء المدرسة السابق.",
          tamayuz: "يحقق أكثر من 90% من المتعلمين تقدماً ملحوظاً في القراءة قياساً على المستوى السابق للمدرسة.",
          tools: ["نتائج الاختبارات الوطنية - نافس"] },
        { code: "3-1-1-5", desc: "يحقق المتعلمون تقدماً في مجال الرياضيات قياساً على المستوى السابق.",
          tamayuz: "يحقق أكثر من 90% من المتعلمين تقدماً ملحوظاً في الرياضيات قياساً على المستوى السابق للمدرسة.",
          tools: ["نتائج الاختبارات الوطنية - نافس"] },
        { code: "3-1-1-6", desc: "يحقق المتعلمون تقدماً في مجال العلوم قياساً على المستوى السابق.",
          tamayuz: "يحقق أكثر من 90% من المتعلمين تقدماً ملحوظاً في العلوم قياساً على المستوى السابق للمدرسة.",
          tools: ["نتائج الاختبارات الوطنية - نافس"] },
      ]},
      { name: "التطور الشخصي والصحي والاجتماعي", code: "3-2", indicators: [
        { code: "3-2-1-1", desc: "يظهر المتعلمون الاعتزاز بالقيم والهوية الوطنية.",
          tamayuz: "يظهر 90% فأكثر من المتعلمين فخرهم بانتمائهم لوطنهم وبإنجازات الوطن وأبنائه، ويعتزون بتراثهم وتاريخهم ولغتهم وعاداتهم، ويُعبرون عن حبهم للوطن.",
          tools: ["استبانة المتعلم", "استبانة المعلم", "استبانة ولي الأمر", "أداة المقابلات"] },
        { code: "3-2-1-2", desc: "يظهر المتعلمون اتجاهات إيجابية نحو ذواتهم.",
          tamayuz: "يظهر 90% فأكثر من المتعلمين مشاعر إيجابية نحو ذواتهم، ولديهم القدرة على تحمل المسؤولية والثقة بالنفس، والتعبير عن سعادتهم والتفاؤل والرضا عن الحياة، والتعامل بإيجابية مع الأهل والأصدقاء.",
          tools: ["استبانة المتعلم", "استبانة المعلم", "استبانة ولي الأمر", "أداة المقابلات"] },
        { code: "3-2-1-3", desc: "يظهر المتعلمون التزاماً بالممارسات الصحية السليمة.",
          tamayuz: "يظهر 90% فأكثر من المتعلمين ممارسات صحية سليمة ووعياً بأهمية تناول الغذاء الصحي، وممارسة النشاط البدني، والحفاظ على سلامة الجسم والعقل.",
          tools: ["استبانة المتعلم", "استبانة المعلم", "استبانة ولي الأمر", "أداة المقابلات"] },
        { code: "3-2-1-4", desc: "يشارك المتعلمون في الأنشطة المجتمعية والأعمال التطوعية.",
          tamayuz: "يُظهر 90% فأكثر من المتعلمين اهتماماً بالمشاركة في الأعمال المجتمعية والأعمال التطوعية داخل المدرسة وخارجها.",
          tools: ["أداة تحليل الوثائق", "استبانة المعلم", "استبانة المتعلم", "استبانة ولي الأمر"] },
        { code: "3-2-1-5", desc: "يلتزم المتعلمون بقواعد السلوك والانضباط المدرسي.",
          tamayuz: "يُظهر 90% فأكثر من المتعلمين سلوكاً منضبطاً والتزاماً ذاتياً بنظام وقواعد المدرسة، ويمواعيد الحضور والانصراف، والحفاظ على الموارد الموجودة بالمدرسة، والالتزام بالزي المدرسي، كما يُظهرون احتراماً وتقديراً لمعلميهم.",
          tools: ["أداة تحليل الوثائق", "استبانة المعلم", "أداة المقابلات"] },
        { code: "3-2-1-6", desc: "يظهر المتعلمون القدرة على البحث والتعلم الذاتي.",
          tamayuz: "يُظهر 90% فأكثر من المتعلمين دافعية ذاتية للتعلم والقدرة على تحديد أهداف تعلمهم، وإدارة الوقت، وتقويم مصادر التعلم، وتحمل مسؤولية تعلمهم، والقدرة على توظيف التقنية الرقمية في البحث والتعلم.",
          tools: ["استبانة المعلم", "استبانة المتعلم", "استبانة ولي الأمر", "أداة المقابلات"] },
        { code: "3-2-1-7", desc: "يظهر المتعلمون اعتزازاً بثقافتهم واحتراماً للتنوع الثقافي.",
          tamayuz: "يُظهر 90% فأكثر من المتعلمين اعتزازاً بثقافة المجتمع وتاريخه وتراثه، ويفخرون بدينهم ولغتهم، كما يُظهرون احتراماً وتفهماً للتنوع الثقافي للشعوب والثقافات الأخرى.",
          tools: ["استبانة المعلم", "استبانة المتعلم", "أداة المقابلات"] },
      ]},
    ]
  },
  {
    domain: "البيئة المدرسية", code: "4", color: "orange",
    standards: [
      { name: "المبنى المدرسي", code: "4-1", indicators: [
        { code: "4-1-1-1", desc: "تنظيم مبنى المدرسة ملائم لعدد المتعلمين والمرحلة العمرية.",
          tamayuz: "تنظيم مبنى المدرسة يتوافق مع عدد المتعلمين وخصائص المرحلة العمرية ومتطلباتها، وتتوافر ساحات مناسبة لممارسة الأنشطة المتنوعة، وتنظيم الأثاث بدرجة متميزة.",
          tools: ["استبانة المعلم", "أداة ملاحظة البيئة المدرسية"] },
        { code: "4-1-1-2", desc: "تتوافر فصول ومعامل ملائمة للعملية التعليمية تلبي احتياجات المتعلمين بمن فيهم ذوو الإعاقة.",
          tamayuz: "تنظيم الفصول الدراسية والمعامل ملائمة للعملية التعليمية ويلبي احتياجات المتعلمين وتحقق الرفاه لهم بدرجة متميزة بمن فيهم ذوو الإعاقة، وتتوافر في المعامل جميع الوسائل والأدوات والمواد اللازمة لتنفيذ أنشطة التعلم.",
          tools: ["استبانة المعلم", "استبانة المتعلم", "أداة ملاحظة البيئة المدرسية"] },
        { code: "4-1-1-3", desc: "تلبي المرافق والخدمات المساندة احتياجات المتعلمين بمن فيهم ذوو الإعاقة.",
          tamayuz: "مرافق المدرسة والخدمات المساندة والساحات والمقصف المدرسي، وأماكن ممارسة الأنشطة والجلوس تلبي احتياجات المتعلمين بمن فيهم ذوو الإعاقة بدرجة متميزة.",
          tools: ["أداة ملاحظة البيئة المدرسية"] },
      ]},
      { name: "الأمن والسلامة", code: "4-2", indicators: [
        { code: "4-2-1-1", desc: "تتوافر في فصول المدرسة ومعاملها وجميع مرافقها متطلبات الأمن والسلامة.",
          tamayuz: "يوجد لدى المدرسة شهادة الأمن والسلامة من الدفاع المدني، وتوفر المدرسة متطلبات الأمن والسلامة التي تناسب احتياجات جميع المتعلمين بمن فيهم ذوو الإعاقة بدرجة متميزة، وتتابع - دائماً - سلامة المتعلمين في مرافق المدرسة وأثناء الدخول والخروج.",
          tools: ["أداة تحليل الوثائق", "استبانة ولي الأمر", "أداة ملاحظة البيئة المدرسية"] },
        { code: "4-2-1-2", desc: "تعمل المدرسة على صيانة جميع مرافق المبنى وتجهيزاته بانتظام.",
          tamayuz: "توفر المدرسة خدمة الصيانة الدورية المستمرة لكافة المرافق والتجهيزات بدرجة متميزة.",
          tools: ["أداة تحليل الوثائق", "استبانة المعلم", "أداة الملاحظة البيئية"] },
        { code: "4-2-1-3", desc: "تعمل المدرسة على نظافة المبنى المدرسي وجميع مرافقه بانتظام.",
          tamayuz: "تعمل المدرسة - دائماً - على نظافة المبنى ومرافقه، وتتابعها بانتظام، وتوفر كوادر للقيام بأعمال النظافة فيها، وتوفر جميع أدوات النظافة اللازمة، وتحفظها في أماكن ملائمة لها.",
          tools: ["استبانة المعلم", "استبانة المتعلم", "أداة ملاحظة البيئة المدرسية"] },
      ]},
    ]
  },
];

const DOMAIN_COLORS = {
  purple: { bg: "bg-purple-600", light: "bg-purple-50 border-purple-200", text: "text-purple-700" },
  blue: { bg: "bg-blue-600", light: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  green: { bg: "bg-green-600", light: "bg-green-50 border-green-200", text: "text-green-700" },
  orange: { bg: "bg-orange-600", light: "bg-orange-50 border-orange-200", text: "text-orange-700" },
};

function EditIndicatorModal({ indicator, onSave, onClose }) {
  const [form, setForm] = useState({
    performance_level: indicator.performance_level || "لم يُقيَّم",
    score_percentage: indicator.score_percentage || "",
    status: indicator.status || "لم يبدأ",
    responsible: indicator.responsible || "",
    notes: indicator.notes || "",
  });

  const handleSave = async () => {
    await onSave(indicator.id, form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-card rounded-xl border border-border w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">{indicator.code}</div>
            <h3 className="font-bold text-sm leading-snug max-w-sm">{indicator.desc}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">مستوى الأداء</label>
            <div className="grid grid-cols-2 gap-2">
              {["تهيئة", "انطلاق", "تقدم", "تميز"].map(level => (
                <button
                  key={level}
                  onClick={() => setForm(f => ({ ...f, performance_level: level }))}
                  className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                    form.performance_level === level
                      ? "border-primary bg-primary text-white"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <PerformanceBadge level={level} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">نسبة التحقق %</label>
            <input
              type="number"
              min="0" max="100"
              value={form.score_percentage}
              onChange={e => setForm(f => ({ ...f, score_percentage: Number(e.target.value) }))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="0 - 100"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">حالة الإنجاز</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {["لم يبدأ", "جاري", "مكتمل", "يحتاج تحسين"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">المسؤول</label>
            <input
              value={form.responsible}
              onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="اسم المسؤول أو دوره"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">ملاحظات</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="أي ملاحظات إضافية..."
            />
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-border">
          <button onClick={handleSave} className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
            <Save size={15} /> حفظ التقييم
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

export default function Standards() {
  const [evaluations, setEvaluations] = useState({});
  const [tasksByCode, setTasksByCode] = useState({});
  const [expandedDomains, setExpandedDomains] = useState({ "1": true });
  const [expandedStandards, setExpandedStandards] = useState({});
  const [editingIndicator, setEditingIndicator] = useState(null);
  const [addingEvidenceFor, setAddingEvidenceFor] = useState(null); // indicator code
  const [saving, setSaving] = useState(false);

  const [evidenceByCode, setEvidenceByCode] = useState({});

  useEffect(() => {
    Promise.all([
      base44.entities.Indicator.list(),
      base44.entities.Task.list(),
      base44.entities.Evidence.list(),
    ]).then(([list, tasks, evidences]) => {
      const map = {};
      list.forEach(i => { map[i.code] = i; });
      setEvaluations(map);

      // Map evidence by indicator_code
      const emap = {};
      evidences.forEach(e => {
        if (e.indicator_code) {
          if (!emap[e.indicator_code]) emap[e.indicator_code] = [];
          emap[e.indicator_code].push(e);
        }
      });
      setEvidenceByCode(emap);

      // Map each task to matching indicator codes
      const tmap = {};
      const addToMap = (code, task) => {
        if (!tmap[code]) tmap[code] = [];
        if (!tmap[code].find(t => t.id === task.id)) tmap[code].push(task);
      };
      const allIndicators = ETEC_STRUCTURE.flatMap(d =>
        d.standards.flatMap(s => s.indicators.map(i => ({ code: i.code, domain: d.domain, standard: s.code, standardName: s.name })))
      );
      tasks.forEach(t => {
        if (!t.indicator_code) return;
        const val = t.indicator_code.trim();
        allIndicators.forEach(ind => {
          if (ind.code === val) { addToMap(ind.code, t); return; }
          if (val.startsWith(ind.standard) || val.includes(ind.standardName)) { addToMap(ind.code, t); return; }
          const taskFirstPart = val.split('-')[0];
          const indFirstPart = ind.code.split('-')[0];
          if (taskFirstPart === indFirstPart && val.split('-').length <= 2) { addToMap(ind.code, t); }
        });
      });
      setTasksByCode(tmap);
    });
  }, []);

  const toggleDomain = (code) => setExpandedDomains(p => ({ ...p, [code]: !p[code] }));
  const toggleStandard = (code) => setExpandedStandards(p => ({ ...p, [code]: !p[code] }));

  const handleSave = async (existingId, code, desc, domainCode, standardCode, form) => {
    setSaving(true);
    const data = { code, description: desc, domain_id: domainCode, standard_id: standardCode, ...form };
    let saved;
    if (existingId) {
      saved = await base44.entities.Indicator.update(existingId, data);
    } else {
      saved = await base44.entities.Indicator.create(data);
    }
    setEvaluations(prev => ({ ...prev, [code]: saved }));
    setSaving(false);
    setEditingIndicator(null);
  };

  const getIndicatorData = (code, desc) => ({
    ...(evaluations[code] || {}),
    code,
    desc,
    performance_level: evaluations[code]?.performance_level || "لم يُقيَّم",
    status: evaluations[code]?.status || "لم يبدأ",
  });

  return (
    <div className="space-y-4 fade-in" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المعايير والمؤشرات</h1>
          <p className="text-muted-foreground text-sm mt-1">تقييم المؤشرات وفق معايير هيئة تقويم التعليم والتدريب</p>
        </div>
        <div className="bg-card border border-border rounded-lg px-4 py-2 text-sm">
          <span className="font-bold text-primary">{Object.keys(evaluations).length}</span>
          <span className="text-muted-foreground"> / 52 مؤشر مُقيَّم</span>
        </div>
      </div>

      {ETEC_STRUCTURE.map((domain) => {
        const colors = DOMAIN_COLORS[domain.color];
        const isExpanded = expandedDomains[domain.code];
        const domainEvaluated = ETEC_STRUCTURE
          .find(d => d.code === domain.code)?.standards
          .flatMap(s => s.indicators)
          .filter(i => evaluations[i.code]).length || 0;
        const domainTotal = domain.standards.flatMap(s => s.indicators).length;

        return (
          <div key={domain.code} className="bg-card rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => toggleDomain(domain.code)}
              className={`w-full flex items-center gap-4 p-4 ${colors.bg} text-white hover:opacity-95 transition-opacity`}
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {domain.code}
              </div>
              <div className="flex-1 text-right">
                <div className="font-bold">{domain.domain}</div>
                <div className="text-xs text-white/70">{domainTotal} مؤشر — {domainEvaluated} مُقيَّم</div>
              </div>
              <ChevronDown size={18} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>

            {isExpanded && (
              <div className="divide-y divide-border">
                {domain.standards.map(standard => {
                  const stdKey = standard.code;
                  const isStdExpanded = expandedStandards[stdKey] !== false;
                  return (
                    <div key={stdKey}>
                      <button
                        onClick={() => toggleStandard(stdKey)}
                        className={`w-full flex items-center gap-3 px-5 py-3 ${colors.light} border-b border-border hover:opacity-90 transition-opacity`}
                      >
                        <ChevronLeft size={15} className={`${colors.text} transition-transform ${isStdExpanded ? "-rotate-90" : ""}`} />
                        <span className={`text-xs font-mono ${colors.text} bg-white/70 px-2 py-0.5 rounded`}>{standard.code}</span>
                        <span className={`font-semibold text-sm ${colors.text}`}>{standard.name}</span>
                        <span className="mr-auto text-xs text-muted-foreground">{standard.indicators.length} مؤشر</span>
                      </button>
                      {isStdExpanded && (
                        <div className="divide-y divide-border/50">
                          {standard.indicators.map(ind => {
                            const data = getIndicatorData(ind.code, ind.desc);
                            return (
                              <div key={ind.code} className="px-5 py-3 hover:bg-secondary/30 transition-colors">
                                 <div className="flex items-start gap-3">
                                   <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded flex-shrink-0 mt-0.5">{ind.code}</span>
                                   <div className="flex-1 min-w-0">
                                     <p className="text-sm leading-relaxed">{ind.desc}</p>
                                     {ind.tamayuz && (
                                       <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                         <span className="font-semibold">★ التميز: </span>{ind.tamayuz}
                                       </p>
                                     )}
                                     {ind.tools && ind.tools.length > 0 && (
                                       <div className="mt-1.5 flex flex-wrap gap-1">
                                         {ind.tools.map(tool => (
                                           <span key={tool} className="text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded px-2 py-0.5 font-medium">{tool}</span>
                                         ))}
                                       </div>
                                     )}
                                     {REQUIRED_DOCS[ind.code] && (
                                       <div className="mt-2">
                                         <div className="text-xs text-blue-600 font-semibold mb-1">📂 الوثائق والسجلات المطلوبة:</div>
                                         <div className="flex flex-wrap gap-1.5">
                                           {REQUIRED_DOCS[ind.code].map(doc => (
                                             <span key={doc} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-2.5 py-1 font-medium">
                                               {doc}
                                             </span>
                                           ))}
                                         </div>
                                       </div>
                                     )}
                                   </div>
                                   <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                                    {/* Assignees from tasks */}
                                    {(tasksByCode[ind.code] || []).filter(t => t.status !== "مكتملة").map(t => (
                                      <span key={t.id} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 font-medium">
                                        👤 {t.assigned_to}
                                      </span>
                                    ))}
                                    {/* Evidence badges */}
                                    {(evidenceByCode[ind.code] || []).map(ev => (
                                      ev.file_url
                                        ? <a key={ev.id} href={ev.file_url} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 font-medium hover:bg-green-100 transition-colors">
                                            📎 يوجد شاهد
                                          </a>
                                        : <span key={ev.id} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 font-medium">📎 يوجد شاهد</span>
                                    ))}
                                    <PerformanceBadge level={data.performance_level} />
                                    {data.score_percentage > 0 && (
                                      <span className="text-xs text-muted-foreground">{data.score_percentage}%</span>
                                    )}
                                    <button
                                      onClick={() => setAddingEvidenceFor(prev => prev === ind.code ? null : ind.code)}
                                      className={`p-1.5 rounded-lg transition-colors ${addingEvidenceFor === ind.code ? "bg-blue-100 text-blue-600" : "hover:bg-blue-50 text-muted-foreground hover:text-blue-600"}`}
                                      title="إضافة شاهد"
                                    >
                                      <PaperclipIcon size={14} />
                                    </button>
                                    <button
                                      onClick={() => setEditingIndicator({ ...data, domainCode: domain.code, standardCode: standard.code })}
                                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    </div>
                                    </div>
                                    {data.responsible && (
                                    <div className="mr-16 mt-1">
                                     <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 font-medium">
                                       👤 {data.responsible}
                                     </span>
                                    </div>
                                    )}
                                    {addingEvidenceFor === ind.code && (
                                     <AddEvidenceInline
                                       indicatorCode={ind.code}
                                       indicatorId={evaluations[ind.code]?.id || null}
                                       onSaved={(saved) => {
                                         setEvidenceByCode(prev => ({
                                           ...prev,
                                           [ind.code]: [...(prev[ind.code] || []), saved],
                                         }));
                                         setAddingEvidenceFor(null);
                                       }}
                                       onClose={() => setAddingEvidenceFor(null)}
                                     />
                                    )}
                                    </div>
                                    );
                                   })}
                                   </div>
                                   )}
                                   </div>
                                   );
                                   })}
              </div>
            )}
          </div>
        );
      })}

      {editingIndicator && (
        <EditIndicatorModal
          indicator={editingIndicator}
          onSave={(_, form) => handleSave(editingIndicator.id, editingIndicator.code, editingIndicator.desc, editingIndicator.domainCode, editingIndicator.standardCode, form)}
          onClose={() => setEditingIndicator(null)}
        />
      )}
    </div>
  );
}